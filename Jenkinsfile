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
        nodejs "NodeJS" 
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
        sh 'npm install'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
      post {
        always {
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
          ssh -p 2260 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes -i $id_ed25519 dev@$DEPLOY_HOST "sudo rm -r $GREEN_ENV && sudo mkdir -p /home/dev/$GREEN_ENV && sudo chown dev:dev /home/dev/$GREEN_ENV"
          scp -P 2260 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes -i $id_ed25519 -r dist/* dev@$DEPLOY_HOST:/home/dev/$GREEN_ENV
          ssh -p 2260 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes -i $id_ed25519 dev@$DEPLOY_HOST "sudo su && chown -R dev:dev /home/dev/$GREEN_ENV; chmod -R a+rX /home/dev/$GREEN_ENV && cp -r /home/dev/green/* /usr/share/nginx/html"
        '''
      }
      }
    }
    stage('Curl to green environment') {
      steps {
        sh 'curl http://192.168.29.47:5000/$GREEN_ENV/'
      }
    }

        stage('Email for Approval to deploy to production environment') {
            steps {
                mail to: 'a.k.gupta159753@gmail.com',
                subject: "Approval Needed for Production Deployment",
                body: """
                Build #${env.BUILD_NUMBER} is readdy for approval
                
                click the following link to approve:
                ${env.BUILD_URL}
                
                Login and click "Proceed" in the Approval Stage
                """
            }
        }
        stage('Approval') {
                steps {
                    timeout(time:15, unit:'MINUTES'){
                        input message: "Do you want to approve the deployment to production environment?", ok:'Approve'
                }
        }
        }
    stage('Deploy to Blue environment') {
      steps {
        sshagent(credentials: ['dev-ssh-key-id']) {
        sh '''
          ssh -p 2260 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes -i $id_ed25519 dev@$DEPLOY_HOST "sudo rm -r $BLUE_ENV && sudo mkdir -p /home/dev/$BLUE_ENV && sudo chown dev:dev /home/dev/$BLUE_ENV"
          scp -P 2260 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes -i $id_ed25519 -r dist/* dev@$DEPLOY_HOST:/home/dev/$BLUE_ENV
          ssh -p 2260 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes -i $id_ed25519 dev@$DEPLOY_HOST "sudo su && chown -R dev:dev /home/dev/$BLUE_ENV; chmod -R a+rX /home/dev/$BLUE_ENV cp -r /home/dev/green/* /usr/share/nginx/html"
        '''
      }
      }
    }
    stage('Curl to blue environment') {
      steps {
        sh 'curl http://192.168.29.47:5000/$BLUE_ENV/'
      }
    }
  }
}
