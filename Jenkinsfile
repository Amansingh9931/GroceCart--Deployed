pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend Build') {
            steps {
                sh '''
                    cd Frontend
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Backend Dependencies') {
            steps {
                sh '''
                    cd Backend
                    npm ci
                '''
            }
        }
    }
}
