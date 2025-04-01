stage('Deploy to Kubernetes') {
    steps {
        script {
            // Authenticate with Docker Hub
            withCredentials([usernamePassword(
                credentialsId: 'dockerhub-creds',
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
            )]) {
                sh """
                docker login -u $DOCKER_USER -p $DOCKER_PASS
                docker push your-dockerhub-username/tender-system:${env.BUILD_NUMBER}
                """
            }
            
            // Update image tag in deployment
            sh """
            kubectl set image deployment/tender-system \
              nginx=your-dockerhub-username/tender-system:${env.BUILD_NUMBER}
            """
        }
    }
}