pipeline{
    agent any
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
                '''
            }   
        }
    }
}