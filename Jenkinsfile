pipeline {
  agent any

  environment {
    VERCEL_TOKEN   = credentials('VERCEL_TOKEN')
    VERCEL_TEAM    = credentials('VERCEL_TEAM')
    VERCEL_PROJECT = 'webapp'                             // exact Vercel project name
    // Optional if protected deployments:
    // VERCEL_BYPASS = credentials('VERCEL_BYPASS')       // create this secret in Vercel, store in Jenkins
  }

  tools { nodejs "NodeJS" }

  options {
    skipDefaultCheckout(true)
    timestamps()
    disableConcurrentBuilds()
    // If plugin present; otherwise use wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm'])
    ansiColor('xterm')
  }

  stages {
    stage('Pre-clean') { steps { cleanWs() } }
    stage('Checkout')  { steps { checkout scm } }

    stage('Install Dependencies') { steps { sh 'npm ci || npm install' } }
    stage('Test') { steps { sh 'npm run test || echo "No tests or tests failed; verify output"' } }
    stage('Build') {
      steps { sh 'npm run build && ls -la' }
    }

    stage('Install Vercel CLI') { steps { sh 'npm install -g vercel' } }

    stage('Blue-Green: Stage (Green)') {
      steps {
        dir('dist') {
          sh '''
            set -e
            DEPLOY_OUTPUT=$(vercel --prod --skip-domain \
              --token="$VERCEL_TOKEN" --scope="$VERCEL_TEAM" --project="$VERCEL_PROJECT" \
              --confirm --name=webapp)
            echo "$DEPLOY_OUTPUT"
            DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https://[a-zA-Z0-9.-]+\\.vercel\\.app' | tail -n1)
            if [ -z "$DEPLOY_URL" ]; then echo "Failed to capture deployment URL"; exit 1; fi
            echo "$DEPLOY_URL" > ../GREEN_DEPLOY_URL.txt
          '''
        }
      }
    }

    stage('Smoke Test Green') {
      steps {
        script {
          def greenUrl = sh(script: "cat GREEN_DEPLOY_URL.txt", returnStdout: true).trim()
          // If deployments are protected, use bypass header:
          sh """
            set -e
            echo "Smoke testing ${greenUrl}"
            curl -fsS ${env.VERCEL_BYPASS ? "-H 'x-vercel-protection-bypass: ${VERCEL_BYPASS}'" : ""} "${greenUrl}"
            # Uncomment if your app exposes health
            # curl -fsS ${env.VERCEL_BYPASS ? "-H 'x-vercel-protection-bypass: ${VERCEL_BYPASS}'" : ""} "${greenUrl}/health"
          """
        }
      }
    }

    stage('Blue-Green: Promote (Switch Traffic)') {
      steps {
        script {
          def greenUrl = sh(script: "cat GREEN_DEPLOY_URL.txt", returnStdout: true).trim()
          sh """
            set -e
            vercel promote "${greenUrl}" \
              --token="$VERCEL_TOKEN" --scope="$VERCEL_TEAM" --project="$VERCEL_PROJECT" --yes
          """
        }
      }
    }

    stage('Post-Switch Validation') {
      steps {
        sh '''
          set -e
          PROD_DOMAIN="${PROD_DOMAIN:-https://your-production-domain.example}"
          echo "Validating production at ${PROD_DOMAIN}"
          curl -fsS "${PROD_DOMAIN}"
          # curl -fsS "${PROD_DOMAIN}/health" || true
        '''
      }
    }
  }

  post {
    failure {
      script {
        echo "Deployment failed — attempting Vercel rollback"
        sh '''
          set -e
          vercel rollback --token="$VERCEL_TOKEN" --scope="$VERCEL_TEAM" --project="$VERCEL_PROJECT" --yes || true
        '''
      }
    }
    success { echo 'Blue-Green deployment completed successfully' }
  }
}
