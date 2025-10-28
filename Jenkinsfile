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
          ssh -p 2260 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes -i $id_ed25519 dev@$DEPLOY_HOST "sudo mkdir -p /home/dev/$GREEN_ENV && sudo chown dev:dev /home/dev/$GREEN_ENV"
          scp -P 2260 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes -i $id_ed25519 -r dist/* dev@$DEPLOY_HOST:/home/dev/$GREEN_ENV
          ssh -p 2260 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes -i $id_ed25519 dev@$DEPLOY_HOST "sudo su && chown -R dev:dev /home/dev/green; chmod -R a+rX /home/dev/green"
        '''
      }
      }
    }
    stage('Curl to green environment') {
      steps {
        sh 'curl http://0.0.0.0:5000/$GREEN_ENV'
      }
    }
  }
}
