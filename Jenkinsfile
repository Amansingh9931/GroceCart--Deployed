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
                'cd ~/grocerycart-ansible && \
                 ansible-playbook -i inventory.ini deploy.yml \
                 --vault-password-file /tmp/grocerycart-vault-password'

                ssh -o StrictHostKeyChecking=no \
                ubuntu@172.31.43.33 \
                'rm -f /tmp/grocerycart-vault-password'
            '''
        }
    }
}
    }
}
