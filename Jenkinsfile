pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'aura9931'
        FRONTEND_IMAGE = 'aura9931/grocecart-frontend'
        BACKEND_IMAGE  = 'aura9931/grocecart-backend'
    }

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

        stage('Frontend Lint') {
            steps {
                sh '''
                    cd Frontend
                    npm run lint
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

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                        -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./Frontend

                    docker build \
                        -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./Backend
                '''
            }
        }

        stage('Docker Hub Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -e

                        echo "$DOCKER_PASSWORD" | docker login \
                            -u "$DOCKER_USERNAME" \
                            --password-stdin

                        docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${FRONTEND_IMAGE}:latest

                        docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${BACKEND_IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy with Ansible') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'ansible-vault-password',
                        variable: 'VAULT_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -e

                        printf '%s\\n' "$VAULT_PASSWORD" | \
                        ssh -o StrictHostKeyChecking=no \
                        ubuntu@172.31.43.33 \
                        'cat > /tmp/grocerycart-vault-password && chmod 600 /tmp/grocerycart-vault-password'

                        ssh -o StrictHostKeyChecking=no \
                        ubuntu@172.31.43.33 \
                        "cd ~/grocerycart-ansible && \
                         ansible-playbook -i inventory.ini deploy.yml \
                         --vault-password-file /tmp/grocerycart-vault-password \
                         -e FRONTEND_IMAGE=aura9931/grocecart-frontend:${BUILD_NUMBER} \
                         -e BACKEND_IMAGE=aura9931/grocecart-backend:${BUILD_NUMBER}"

                        ssh -o StrictHostKeyChecking=no \
                        ubuntu@172.31.43.33 \
                        'rm -f /tmp/grocerycart-vault-password'
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
    }
}
