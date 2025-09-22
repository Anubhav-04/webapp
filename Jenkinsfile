pipeline{
    agent any
    environment {
        NODE_TOKEN = credentials('NODE_TOKEN')
    }
    tools {
        nodejs "NodeJS"   // Use the NodeJS version configured in Jenkins
    }
    options {
        skipDefaultCheckout(true)
    }
    stages {
        stage('Pre-clean') {
            steps {
                // Clean workspace before code checkout
                cleanWs()
            }
        }
        stage('Checkout') {
            steps {
                // Check out your code from SCM
                checkout scm
            }
        }
        stage('Approval') {
            steps {
                timeout(1) {
                    script {
                        input message: 'Approve to proceed?', ok: 'Approve'
                    }
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
        }
        }
        stage('Test') {
            steps {
                sh '''
                    npm run test
                '''
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
                // Install Vercel CLI if it's not already available
                sh 'npm install -g vercel'
            }
        }
        stage('Deploy to Vercel') {
            steps {
                dir('dist') {
                    sh 'vercel --prod --token=$NODE_TOKEN --confirm --name=webapp'
                }
            }
        }
    }
}