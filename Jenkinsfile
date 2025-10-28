pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  environment {
    APP_NAME   = 'my-react-app'
    BLUE_ENV   = 'blue'
    GREEN_ENV  = 'green'
    ACTIVE     = 'blue'
    DEPLOY_HOST = 'host.docker.internal'
    id_ed25519 = credentials('id_ed25519')
  }
  tools {
        nodejs "NodeJS"   // Use the NodeJS version configured in Jenkins
    }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        // Use npm ci for clean, reproducible installs
        sh 'npm install'
      }
    }

    stage('Test') {
      steps {
        // Vitest in jsdom environment
        sh 'npm test'
      }
      post {
        always {
          // If you output junit from Vitest, publish here; otherwise keep as-is
          echo 'Tests completed'
        }
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Deploy to GREEN environment') {
      steps {
        sshagent(credentials: ['dev-ssh-key-id']) {
        sh '''
          scp -P 2260 -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i $id_ed25519 -r dist/* dev@$DEPLOY_HOST:/usr/share/nginx/html/
        '''
      }
      }
    }
  }
}
