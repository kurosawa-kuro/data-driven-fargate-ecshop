# data-services-python

## 環境構築ガイド

### 1. システム更新とPythonインストール
```bash
# システムパッケージの更新
sudo apt update

# Python3と関連ツールのインストール
sudo apt install python3 python3-pip python-is-python3
```

### 2. バージョン確認
```bash
# Pythonバージョンの確認
python3 --version

# pipバージョンの確認
pip3 --version
```

### 3. 仮想環境のセットアップ
```bash
# 仮想環境の作成
python3 -m venv myenv

# 仮想環境の有効化
source myenv/bin/activate
```

### 4. 必要なパッケージのインストール
```bash
# データ分析関連パッケージのインストール
pip3 install scikit-learn numpy pandas matplotlib skl2onnx
pip3 install tensorflow tf2onnx numpy scikit-learn
pip3 install fastapi uvicorn tensorflow numpy
```

pip3 install numpy
pip3 install scikit-learn
pip3 install tensorflow
pip3 install tf2onnx

## 注意事項
- `.gitignore`に`myenv/`を追加することを推奨
- `requirements.txt`の生成：
```bash
pip freeze > requirements.txt
```

## 開発環境
- Python 3.x
- scikit-learn
- numpy
- pandas
- matplotlib

この構成により、データ分析やML開発のための基本的な環境が整います。



# モデルの学習
python script.py --train

# ONNXへの変換
python script.py --convert

# 予測
python script.py --predict "5.1,3.5,1.4,0.2"

# WSLのメモリ制限を設定
# ホームディレクトリに.wslconfigファイルを作成
echo "[wsl2]" > ~/.wslconfig
echo "memory=8GB" >> ~/.wslconfig