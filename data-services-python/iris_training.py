from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
import joblib

# Iris データセットを読み込む
iris = load_iris()
X = iris.data  # 特徴量
y = iris.target  # ラベル

# データセットを訓練用とテスト用に分割
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# K-Nearest Neighbors (KNN) モデルを作成
knn = KNeighborsClassifier(n_neighbors=3)

# モデルを訓練
knn.fit(X_train, y_train)

# モデルを保存
joblib.dump(knn, 'iris_knn_model.pkl')

# モデルを読み込み
knn = joblib.load('iris_knn_model.pkl')

# 新しいデータに対する推論
new_data = [[6.7, 3.0, 5.2, 2.3]]  # 例: setosa に近いデータ
prediction = knn.predict(new_data)

# 予測結果を表示
print(f"予測結果: {iris.target_names[prediction][0]}")