#!/bin/bash

# デバッグモードを有効化
# set -x

function get_aws_credentials() {
    read -p "AWS Access Key IDを入力してください: " AWS_ACCESS_KEY_ID
    read -sp "AWS Secret Access Keyを入力してください: " AWS_SECRET_ACCESS_KEY
    echo
}

function configure_aws_cli() {
    aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
    aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
}

function set_default_region() {
    aws configure set region ap-northeast-1
}

function set_output_format() {
    aws configure set output json
}

function verify_configuration() {
    aws configure list
}

# メイン処理
function main() {
    get_aws_credentials
    configure_aws_cli
    set_default_region
    set_output_format
    verify_configuration
}

main
