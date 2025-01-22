export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">注文履歴</h1>
      
      {/* 注文履歴カード */}
      <div className="space-y-6">
        <div className="border rounded-lg p-4 shadow-sm">
          {/* 上部: 注文情報 */}
          <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
            <div>注文日: 2024年3月15日</div>
            <div>合計: ¥12,800</div>
          </div>
          
          {/* 下部: 商品情報 */}
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded">
              <img 
                src="https://picsum.photos/id/1/180/200"
                alt="商品画像" 
                className="w-full h-full object-cover rounded"
              />
            </div>
            
            <div className="flex-grow">
              <h3 className="font-medium">商品名がここに入ります</h3>
              <p className="text-sm text-gray-600">数量: 1</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                返品
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                再度購入
              </button>
              <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                レビューを書く
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}