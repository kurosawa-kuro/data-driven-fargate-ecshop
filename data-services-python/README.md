# data-services-python

本ドキュメントは、Pythonを用いたデータ分析および機械学習（ML）開発の環境構築と基本操作について説明します。

## 目次
1. [環境構築ガイド](#環境構築ガイド)
   - [システム更新とPythonインストール](#システム更新とpythonインストール)
   - [バージョン確認](#バージョン確認)
   - [仮想環境のセットアップ](#仮想環境のセットアップ)
   - [必要なパッケージのインストール](#必要なパッケージのインストール)
2. [注意事項](#注意事項)
3. [開発環境](#開発環境)
4. [モデルの学習と実行](#モデルの学習と実行)
   - [モデルの学習](#モデルの学習)
   - [ONNXへの変換](#onnxへの変換)
   - [予測の実行](#予測の実行)
5. [WSLのメモリ制限設定](#wslのメモリ制限設定)
6. [サーバー起動](#サーバー起動)

---

## 環境構築ガイド

### システム更新とPythonインストール

以下の手順で、システムパッケージの更新、Python のインストール、及び仮想環境の作成を行います。

#### 1. システムパッケージの更新と依存ライブラリのインストール

# Update system package list
sudo apt update

# Install build tools and necessary libraries for building Python
sudo apt install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev \
  xz-utils tk-dev libffi-dev liblzma-dev python-openssl git

#### 2. pyenv を用いた Python 3.11.5 のインストール

# Install pyenv via the official installer script
curl https://pyenv.run | bash

# Set up pyenv environment variables (add these lines to your ~/.bashrc or ~/.zshrc)
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv init -)"

# Reload shell configuration if necessary
source ~/.bashrc

# Confirm pyenv installation and install Python 3.11.5
pyenv --version
pyenv install 3.11.5
pyenv local 3.11.5

#### 3. 仮想環境の作成と初期設定

# Create a virtual environment using the installed Python version
python3 -m venv myenv

# Activate the virtual environment
source myenv/bin/activate

# Upgrade pip and install required packages
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

### バージョン確認

Pythonおよびpipのバージョン確認を行います。

```bash
# Pythonバージョンの確認
python3 --version

# pipバージョンの確認
pip3 --version
```

### 仮想環境のセットアップ

プロジェクトごとに仮想環境を構築し、依存関係管理の容易性と安全性を確保します。

```bash
# 仮想環境の作成
python3 -m venv myenv

# 仮想環境の有効化
source myenv/bin/activate
```

### 必要なパッケージのインストール

データ分析及び機械学習関連パッケージ、API開発に必要なパッケージをインストールします。

```bash
# データ分析関連パッケージのインストール
pip3 install numpy pandas matplotlib scikit-learn skl2onnx

# 機械学習/ディープラーニング関連パッケージのインストール
pip3 install tensorflow tf2onnx

# API開発関連パッケージのインストール
pip3 install fastapi uvicorn
```

また、必要に応じて個別のパッケージを以下のようにインストールすることも可能です。

```bash
pip3 install numpy
pip3 install scikit-learn
pip3 install tensorflow
pip3 install tf2onnx
pip3 install onnxruntime
```

---

## 注意事項

- **.gitignore:** 仮想環境のディレクトリ `myenv/` はバージョン管理から除外することを推奨します。  
- **requirements.txt の生成:** プロジェクトの依存パッケージを管理するため、以下のコマンドで `requirements.txt` を生成してください。

```bash
pip freeze > requirements.txt
```

---

## 開発環境

本プロジェクトで使用する主な環境は以下の通りです。

- Python 3.x
- scikit-learn
- numpy
- pandas
- matplotlib

上記環境により、データ分析およびML開発がスムーズに進むよう構成されています。

---

## モデルの学習と実行

以下の手順により、モデルの学習、ONNX形式への変換、及び予測の実行を行います。

### モデルの学習

学習用スクリプトを実行し、モデルの学習を行います。

```bash
python script.py --train
```

### ONNXへの変換

学習済みモデルをONNX形式に変換するには、以下のコマンドを実行します。

```bash
python script.py --convert
```

### 予測の実行

変換済みもしくは学習済みモデルを用いて予測を実行します。入力はカンマ区切りの特徴量です。

```bash
python script.py --predict "5.1,3.5,1.4,0.2"
```

---

## WSLのメモリ制限設定

WSL2環境では、メモリ使用量の制限を設定することが可能です。以下の手順を実施してください。

1. ホームディレクトリに `.wslconfig` ファイルを作成し、WSL2の設定を追加します。

```bash
echo "[wsl2]" > ~/.wslconfig
echo "memory=8GB" >> ~/.wslconfig
```

```
free -h    # メモリ使用量の確認
nproc      # プロセッサ数の確認
```

---

## サーバー起動

FastAPIなどのASGIサーバーを起動するには、以下のコマンドを使用します。

```bash
uvicorn main:app --reload
```

---

以上の手順に従うことで、データ分析及びML開発に最適な環境が整い、効率的な開発作業が可能となります。

pip install -r requirements.txt