# AIチャットボットプロジェクト

このプロジェクトは、AIを活用したチャットボットアプリケーションです。モノレポ（単一リポジトリ）構造を採用し、Laravelでバックエンド、Next.jsでフロントエンドを構築します。リアルタイムの対話機能を提供し、スケーラブルでメンテナンスしやすいシステムを目指します。

## システム概要

AIチャットボットは、ユーザーがAIと対話できるウェブアプリケーションです。バックエンドはチャットロジック（例：自然言語処理、会話履歴の保存）を処理し、フロントエンドは直感的なチャットインターフェースを提供します。AWSをデプロイ先に選び、信頼性、スケーラビリティ、トラブルシューティングのしやすさを重視。枯れた技術を採用し、市場価値の高いスキルを最大化します。

- **バックエンド**：チャットAPI（例：`/api/chat`）やデータベース操作（会話履歴の保存）を担当。
- **フロントエンド**：リアルタイム更新可能なチャットUIを提供。
- **デプロイ**：AWS EC2（バックエンド）、S3 + CloudFront（フロントエンド）、RDS（MySQL）で運用。
- **CI/CD**：GitHub Actionsでテストとデプロイを自動化。
- **ローカル開発**：Dockerで一貫した開発環境を構築。

## 技術スタック

技術スタックは、成熟した技術（枯れた技術）を優先し、市場価値、情報量の豊富さ、開発者のMySQLへの慣れを考慮して選定しました。

| コンポーネント | 技術                   | 選定理由                                                                 |
|----------------|------------------------|-------------------------------------------------------------------------|
| **バックエンド** | Laravel 11 (PHP 8.2)   | 成熟したMVCフレームワーク、巨大なコミュニティ（Stack Overflowで50万件）、API開発に最適。 |
| **フロントエンド** | Next.js 14 (React)   | Reactベース、大企業採用（例：Netflix）、SSR/静的生成をサポート。         |
| **サーバー**   | EC2 (Amazon Linux 2023, Nginx) | AWSの信頼性高い計算リソース、透明性、豊富なドキュメント（10万件）。     |
| **データベース** | RDS (MySQL 8.0)      | 開発者の慣れたDB、広く使われる（60万件）、エンタープライズ標準。         |
| **キャッシュ** | Redis 7                | セッション/リアルタイム処理の標準（例：Xの通知）、高い需要。             |
| **フロントエンドホスト** | S3 + CloudFront    | 静的配信のデファクト、Xもメディアに使用、低レイテンシのCDN。            |
| **コンテナ**   | Docker                 | ローカル開発の標準、環境差分を最小化（GitHubスター140k）。             |
| **CI/CD**      | GitHub Actions         | モダンなCI/CD、Xも採用、設定簡単（GitHubプロジェクトの90%が使用）。     |
| **テスト**     | PHPUnit, Jest          | Laravel/Next.jsのデフォルト、コード品質を保証、広くサポート。            |
| **モニタリング** | CloudWatch, Sentry   | AWSネイティブのログ、業界標準のエラー追跡、SREの入門スキル。            |

## 開発方針

開発プロセスは、安定性、スケーラビリティ、メンテナンス性を確保し、市場価値の高い技術を活用します。環境差分を最小化し、デプロイを効率化するワークフローを採用します。

### 1. ローカル開発環境の構築
- **目的**：Dockerで本番環境に近い一貫したローカル環境を構築。
- **手順**：
  1. リポジトリをクローン：
     ```bash
     git clone <github-repo-url> chatbot-app
     cd chatbot-app
     ```
  2. Docker Composeを設定：
     ```yaml
     # docker-compose.yml
     version: '3.8'
     services:
       backend:
         build: ./backend
         ports:
           - "9000:9000"
         volumes:
           - ./backend:/var/www
         environment:
           - APP_ENV=local
           - DB_HOST=mysql
           - DB_DATABASE=chatbot
           - DB_USERNAME=admin
           - DB_PASSWORD=securepassword
       frontend:
         build: ./frontend
         ports:
           - "3000:3000"
         volumes:
           - ./frontend:/app
       mysql:
         image: mysql:8.0
         environment:
           - MYSQL_DATABASE=chatbot
           - MYSQL_USER=admin
           - MYSQL_PASSWORD=securepassword
           - MYSQL_ROOT_PASSWORD=securepassword
         ports:
           - "3306:3306"
         command: --default-authentication-plugin=mysql_native_password
       redis:
         image: redis:7
         ports:
           - "6379:6379"
     ```
  3. ビルドと起動：
     ```bash
     docker-compose up -d
     cd backend
     composer install
     cp .env.example .env
     php artisan key:generate
     php artisan migrate
     cd ../frontend
     npm install
     npm run dev
     ```
  4. 動作確認：
     - バックエンド：`http://localhost:9000`
     - フロントエンド：`http://localhost:3000`
     - MySQL：`docker-compose exec mysql mysql -u admin -p -e "SHOW TABLES;"`

- **ハマりどころ**：
  - **Dockerのメモリ不足**：ビルドが失敗する場合。
    ```bash
    docker system prune
    ```
  - **MySQL接続エラー**（`SQLSTATE[HY000] [2002]`）：ログを確認。
    ```bash
    docker-compose logs mysql
    ```
  - **LaravelのAPP_KEY未設定**：キーを生成。
    ```bash
    cd backend
    php artisan key:generate
    ```
  - **MySQL認証プラグインの不整合**：`mysql_native_password`を指定。
    ```yaml
    command: --default-authentication-plugin=mysql_native_password
    ```

### 2. GitHub Actionsでソフトウェアの安全性を担保
- **目的**：`main`および`production`ブランチへのプッシュ時に自動テストを実行し、コード品質を確保。
- **手順**：
  1. GitHub Actionsワークフローを作成：
     ```yaml
     # .github/workflows/ci.yml
     name: CI
     on:
       push:
         branches: [ main, production ]
     jobs:
       test:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v4
           - name: Setup PHP
             uses: shivammathur/setup-php@v2
             with: { php-version: '8.2' }
           - name: Backend Tests
             run: cd backend && composer install && ./vendor/bin/phpunit
           - name: Setup Node.js
             uses: actions/setup-node@v4
             with: { node-version: '18' }
           - name: Frontend Tests
             run: cd frontend && npm install && npm test
           - name: Docker Test
             run: |
               docker-compose build
               docker-compose run backend php artisan test
               docker-compose run frontend npm test
     ```
  2. コミットとプッシュ：
     ```bash
     git add .
     git commit -m "Add CI workflow"
     git push origin main
     ```
  3. GitHub ActionsのUIでテスト結果を確認。

- **ハマりどころ**：
  - **テスト依存関係の欠如**：テストツールが不足。
    ```bash
    cd backend
    composer require --dev phpunit/phpunit
    cd ../frontend
    npm install --save-dev jest
    ```
  - **Dockerテストの失敗**：イメージの互換性を確認。
    ```bash
    docker-compose logs
    ```
  - **ワークフローの構文エラー**：YAMLを検証。
    ```bash
    yamllint .github/workflows/ci.yml
    ```

### 3. AWSへのデプロイ
- **目的**：主要機能の実装後、AWS（EC2、S3 + CloudFront、RDS MySQL）に手動デプロイ。
- **手順**：
  1. **EC2のセットアップ（バックエンド）**：
     ```bash
     aws ec2 run-instances \
       --image-id ami-0c55b159cbfafe1f0 \
       --instance-type t3.micro \
       --key-name chatbot-key \
       --security-group-ids <sg-id> \
       --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=chatbot-backend}]'
     ssh -i chatbot-key.pem ec2-user@<ec2-ip>
     sudo yum update -y
     sudo yum install -y php82 php-fpm nginx mysql80 git
     sudo systemctl enable nginx php-fpm
     sudo mkdir -p /var/www/html
     sudo chown ec2-user:ec2-user /var/www/html
     git clone <github-repo-url> /var/www/html
     cd /var/www/html/backend
     composer install --no-dev --optimize-autoloader
     cp .env.example .env
     nano .env
     # APP_ENV=production, DB_HOST=<rds-endpoint>, DB_DATABASE=chatbot, DB_USERNAME=admin, DB_PASSWORD=securepassword
     php artisan key:generate
     php artisan migrate
     sudo nano /etc/nginx/conf.d/laravel.conf
     ```
     ```nginx
     server {
         listen 80;
         server_name <ec2-ip>;
         root /var/www/html/backend/public;
         index index.php;
         location / {
             try_files $uri $uri/ /index.php?$query_string;
         }
         location ~ \.php$ {
             fastcgi_pass 127.0.0.1:9000;
             fastcgi_index index.php;
             fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
             include fastcgi_params;
         }
     }
     ```
     ```bash
     sudo systemctl restart nginx php-fpm
     ```
  2. **RDS MySQLのセットアップ**：
     ```bash
     aws rds create-db-instance \
       --db-instance-identifier chatbot-db \
       --db-instance-class db.t3.micro \
       --engine mysql \
       --engine-version 8.0 \
       --allocated-storage 20 \
       --master-username admin \
       --master-user-password securepassword123 \
       --db-name chatbot \
       --publicly-accessible
     aws ec2 authorize-security-group-ingress \
       --group-id <rds-sg> \
       --protocol tcp \
       --port 3306 \
       --source-group <ec2-sg>
     mysql -h <rds-endpoint> -u admin -p -e "SHOW TABLES;"
     ```
  3. **S3 + CloudFront（フロントエンド）**：
     ```bash
     cd frontend
     npm run build
     npm run export
     aws s3 mb s3://chatbot-frontend
     aws s3 website s3://chatbot-frontend --index-document index.html --error-document error.html
     aws s3 sync frontend/out/ s3://chatbot-frontend --acl public-read
     aws s3api put-bucket-policy --bucket chatbot-frontend --policy '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::chatbot-frontend/*"}]}'
     aws cloudfront create-distribution \
       --origin-domain-name chatbot-frontend.s3.amazonaws.com \
       --default-root-object index.html
     ```

- **ハマりどころ**：
  - **EC2のセキュリティグループ**：ポート80/3306が閉じていると接続エラー。
    ```bash
    aws ec2 authorize-security-group-ingress --group-id <sg-id> --protocol tcp --port 80 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id <sg-id> --protocol tcp --port 3306 --source-group <rds-sg>
    ```
  - **Nginxの502エラー**：ログを確認し、サービスを再起動。
    ```bash
    sudo tail -f /var/log/nginx/error.log
    sudo systemctl restart php-fpm
    ```
  - **RDS MySQLの接続エラー**（`SQLSTATE[HY000] [2002]`）：エンドポイントと認証情報を確認。
    ```bash
    mysql -h <rds-endpoint> -u admin -p -e "SHOW DATABASES;"
    ```
  - **S3の403エラー**：公開ポリシーを確認。
    ```bash
    aws s3api get-bucket-policy --bucket chatbot-frontend
    ```
  - **MySQLの文字セット不整合**：`utf8mb4`を設定。
    ```bash
    mysql -h <rds-endpoint> -u admin -p -e "ALTER DATABASE chatbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    ```

### 4. 環境差分の対応
- **目的**：ローカル（Docker）と本番（AWS）の環境差分を必要に応じて解決。
- **アプローチ**：
  - Dockerで本番環境（例：PHP 8.2、MySQL 8.0）を模擬し、差分を最小化。
  - 問題発生時はログとコミュニティリソース（例：Stack Overflow、AWSフォーラム）でデバッグ。
  - 解決策をこのREADMEに記録し、再現性を確保。
- **ハマりどころ**：
  - **PHP/MySQLのバージョン不一致**：バージョンを確認。
    ```bash
    php -v
    mysql -h <rds-endpoint> -u admin -p -e "SELECT VERSION();"
    ```
  - **ファイルパーミッション**：EC2で正しい所有権を設定。
    ```bash
    sudo chown -R ec2-user:ec2-user /var/www/html
    ```
  - **環境変数**：`.env`設定を確認。
    ```bash
    cat backend/.env
    ```

### 5. GitHub Actionsで自動デプロイ
- **目的**：手動デプロイが安定したら、`production`ブランチへのマージでAWSに自動デプロイ。
- **手順**：
  1. CIワークフローにデプロイを追加：
     ```yaml
     # .github/workflows/ci.yml
     deploy-backend:
       needs: test
       if: github.ref == 'refs/heads/production'
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Deploy to EC2
           env:
             EC2_KEY: ${{ secrets.EC2_KEY }}
             EC2_IP: ${{ secrets.EC2_IP }}
           run: |
             echo "$EC2_KEY" > key.pem
             chmod 400 key.pem
             scp -i key.pem -r backend ec2-user@$EC2_IP:/var/www/html/backend
             ssh -i key.pem ec2-user@$EC2_IP "cd /var/www/html/backend && composer install --no-dev && php artisan migrate && sudo systemctl restart php-fpm"
     deploy-frontend:
       needs: test
       if: github.ref == 'refs/heads/production'
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with: { node-version: '18' }
         - name: Build Frontend
           run: cd frontend && npm install && npm run build && npm run export
         - name: Deploy to S3
           env:
             AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
             AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             AWS_REGION: ${{ secrets.AWS_REGION }}
           run: aws s3 sync frontend/out/ s3://chatbot-frontend --acl public-read
         - name: Invalidate CloudFront
           run: aws cloudfront create-invalidation --distribution-id <cloudfront-id> --paths "/*"
     ```
  2. GitHub Secretsを設定（Settings > Secrets and variables > Actions）：
     - `EC2_KEY`：SSHキーの内容。
     - `EC2_IP`：EC2のパブリックIP。
     - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`：AWS IAM認証情報。
  3. デプロイをテスト：
     ```bash
     git checkout production
     git merge main
     git push origin production
     ```

- **ハマりどころ**：
  - **Secretsの設定ミス**：認証エラーが発生。
    ```bash
    aws sts get-caller-identity
    ```
  - **SSHパーミッションエラー**：キーのパーミッションを修正。
    ```yaml
    chmod 400 key.pem
    ```
  - **CloudFrontのID欠如**：ディストリビューションを確認。
    ```bash
    aws cloudfront list-distributions
    ```

## 貢献ガイド

- **ブランチ戦略**：`main`で開発、`production`でデプロイ。
- **テスト**：全機能にPHPUnit/Jestテストを書き、カバレッジ80%以上を目指す。
- **ドキュメント**：新しい設定やハマりどころをこのREADMEに追記。
- **モニタリング**：CloudWatchでログ、Sentryでエラー追跡。

## ライセンス

MITライセンス。詳細は[LICENSE](LICENSE)を参照。
