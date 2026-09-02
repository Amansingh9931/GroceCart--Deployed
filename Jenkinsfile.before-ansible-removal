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
	
	stage('Deploy to Kubernetes') {
    steps {
        sh '''
            set -e

            echo "=========================================="
            echo "Deploying to Kubernetes"
            echo "Backend:  ${BACKEND_IMAGE}:${BUILD_NUMBER}"
            echo "Frontend: ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no \
                ubuntu@172.31.39.240 "
                    set -e

                    echo 'Updating backend...'
                    kubectl -n grocerycart set image \
                        deployment/grocerycart-backend \
                        backend=${BACKEND_IMAGE}:${BUILD_NUMBER}

                    echo 'Updating frontend...'
                    kubectl -n grocerycart set image \
                        deployment/grocerycart-frontend \
                        frontend=${FRONTEND_IMAGE}:${BUILD_NUMBER}

                    echo 'Waiting for backend rollout...'
                    kubectl -n grocerycart rollout status \
                        deployment/grocerycart-backend \
                        --timeout=180s

                    echo 'Waiting for frontend rollout...'
                    kubectl -n grocerycart rollout status \
                        deployment/grocerycart-frontend \
                        --timeout=180s

                    echo 'Kubernetes deployments:'
                    kubectl -n grocerycart get deployments

                    echo 'Kubernetes pods:'
                    kubectl -n grocerycart get pods
                "
        '''
    }
}

stage('Kubernetes Health Check') {
    steps {
        sh '''
            set -e

            echo "Checking Kubernetes application health..."

            ssh -o StrictHostKeyChecking=no \
                ubuntu@172.31.39.240 \
                "curl -f http://localhost/api/health"

            echo ""
            echo "Kubernetes application is healthy."
        '''
    }
}
    }


    post {
        always {
            sh 'docker image prune -f || true'
        }
    }
}
