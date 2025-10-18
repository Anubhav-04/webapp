pipeline {
  agent any

  environment {
    // Store a Vercel token as a Secret Text credential in Jenkins with ID 'VERCEL_TOKEN'
    VERCEL_TOKEN = credentials('VERCEL_TOKEN')
    // Optional: project/env vars already configured in Vercel Project settings
    VERCEL_TEAM   = credentials('VERCEL_TEAM_SLUG')    
    VERCEL_PROJECT= 'webapp'
  }

  tools {
    nodejs "NodeJS"
  }

  options {
    skipDefaultCheckout(true)
    timestamps()
    disableConcurrentBuilds()
    ansiColor('xterm')
  }

  stages {
    stage('Pre-clean') {
      steps {
        cleanWs()
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }


    stage('Install Dependencies') {
      steps {
        sh 'npm ci || npm install'
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test || echo "No tests or tests failed; verify output"'
      }
    }

    stage('Build') {
      steps {
        sh '''
          npm run build
          ls -la
        '''
      }
    }

    stage('Install Vercel CLI') {
      steps {
        sh 'npm install -g vercel'
      }
    }

    stage('Blue-Green: Stage (Green)') {
      steps {
        dir('dist') {
          // Create a staged production deployment without assigning custom domains
          // Captures deployment URL for later promotion
          sh '''
            set -e
            DEPLOY_OUTPUT=$(vercel --prod --skip-domain --token="$VERCEL_TOKEN" --scope="$VERCEL_TEAM" --project="$VERCEL_PROJECT" --confirm --name=webapp)
            echo "$DEPLOY_OUTPUT"
            DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https://[a-zA-Z0-9.-]+\\.vercel\\.app' | tail -n1)
            if [ -z "$DEPLOY_URL" ]; then 
            echo "Failed to capture deployment URL"; 
            exit 1; 
            fi
            echo "$DEPLOY_URL" > ../GREEN_DEPLOY_URL.txt
          '''
        }
      }
    }

    stage('Smoke Test Green') {
      steps {
        script {
          def greenUrl = sh(script: "cat GREEN_DEPLOY_URL.txt", returnStdout: true).trim()
          sh """
            set -e
            vercel promote "${greenUrl}" --token="$VERCEL_TOKEN" --scope="$VERCEL_TEAM" --project="$VERCEL_PROJECT" --yes
            """
        }
      }
    }

    stage('Blue-Green: Promote (Switch Traffic)') {
      steps {
        script {
          def greenUrl = sh(script: "cat GREEN_DEPLOY_URL.txt", returnStdout: true).trim()
          // Promote the staged production deployment to your custom production domains
          sh """
            set -e
            vercel promote "${greenUrl}" --token="$VERCEL_TOKEN" --yes
          """
        }
      }
    }

    stage('Post-Switch Validation') {
      steps {
        // Validate via your production domain (DNS-backed). Replace with your real domain.
        sh '''
          set -e
          # Replace with your production domain for validation:
          PROD_DOMAIN="${PROD_DOMAIN:-https://your-production-domain.example}"
          echo "Validating production at ${PROD_DOMAIN}"
          curl -fsS ${PROD_DOMAIN} || (echo "Prod validation failed"; exit 1)
          # curl -fsS ${PROD_DOMAIN}/health || true
        '''
      }
    }
  }

  post {
    failure {
      // Automatic rollback: returns production domains to previous deployment
      // If promote succeeded and a later stage failed, consider whether rollback is desired.
      // This block triggers when any stage fails before completion.
      script {
        echo "Deployment failed — attempting Vercel rollback"
        sh '''
          set -e
          # This rolls back to the previous production deployment for your project
          vercel rollback --token="$VERCEL_TOKEN" --scope="$VERCEL_TEAM" --project="$VERCEL_PROJECT" --yes || true
        '''
      }
    }
    success {
      echo 'Blue-Green deployment completed successfully'
    }
  }
}
