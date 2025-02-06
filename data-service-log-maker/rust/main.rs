use std::fs::File;
use std::io::Write;
use rand::Rng;
use chrono::{Utc, TimeZone};
use serde::Serialize;

/// Returns a random ISO timestamp between 2024-01-01T00:00:00.000Z and 2025-12-31T23:59:59.999Z.
fn get_random_timestamp() -> String {
    let start_str = "2024-01-01T00:00:00.000Z";
    let end_str = "2025-12-31T23:59:59.999Z";
    let start = chrono::DateTime::parse_from_rfc3339(start_str)
        .unwrap()
        .with_timezone(&Utc);
    let end = chrono::DateTime::parse_from_rfc3339(end_str)
        .unwrap()
        .with_timezone(&Utc);
    let start_ms = start.timestamp_millis();
    let end_ms = end.timestamp_millis();
    let mut rng = rand::thread_rng();
    let random_ms = rng.gen_range(start_ms..end_ms);
    let dt = Utc.timestamp_millis(random_ms);
    dt.to_rfc3339()
}

/// Returns a random element from a slice.
fn get_random_element<'a, T>(arr: &'a [T]) -> &'a T {
    let mut rng = rand::thread_rng();
    let idx = rng.gen_range(0..arr.len());
    &arr[idx]
}

/// Converts a u64 number to base36 string.
fn to_base36(mut n: u64) -> String {
    let digits = "0123456789abcdefghijklmnopqrstuvwxyz";
    if n == 0 {
        return "0".to_string();
    }
    let mut result = String::new();
    while n > 0 {
        let rem = (n % 36) as usize;
        result.push(digits.chars().nth(rem).unwrap());
        n /= 36;
    }
    result.chars().rev().collect()
}

/// Generates a unique request ID.
fn generate_request_id() -> String {
    let now = Utc::now().timestamp_millis();
    let mut rng = rand::thread_rng();
    let rnd: u64 = rng.gen_range(0..1_000_000_000);
    format!("req-{}-{}", now, to_base36(rnd))
}

/// Generates a unique order ID.
fn generate_order_id() -> String {
    let now = Utc::now().timestamp_millis();
    let mut rng = rand::thread_rng();
    let rnd: u64 = rng.gen_range(0..1_000_000_000);
    format!("order-{}-{}", now, to_base36(rnd))
}

/// Extracts numeric digits from the given string.
/// If no digit is found, returns 0.
fn parse_numeric_id(id: &str) -> i32 {
    let digits: String = id.chars().filter(|c| c.is_digit(10)).collect();
    if digits.is_empty() {
        0
    } else {
        digits.parse().unwrap_or(0)
    }
}

/// ユーザーデータ
#[derive(Clone)]
struct User {
    id: String,
}

/// 商品データ
#[derive(Clone)]
struct Product {
    id: String,
    name: String,
    price: i32,
    category_id: String,
}

/// カテゴリーデータ
#[derive(Clone)]
struct Category {
    id: String,
    name: String,
}

/// ログ出力用の各種構造体（シリアライズのためSerializeトレイトを導入）
#[derive(Serialize, Debug)]
struct Context {
    page_url: String,
    referrer: String,
    session_id: String,
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
}

#[derive(Serialize, Debug)]
struct ProductData {
    product_id: i32,
    product_name: String,
    product_price: i32,
    quantity: i32,
    category_id: i32,
    category_name: String,
}

#[derive(Serialize, Debug)]
struct SearchData {
    keyword: String,
    category_id: String,
    category_name: String,
}

#[derive(Serialize, Debug)]
struct Metadata {
    additional_info: String,
}

#[derive(Serialize, Debug)]
struct OrderData {
    order_id: String,
}

#[derive(Serialize, Debug)]
struct Log {
    timestamp: String,
    request_id: String,
    log_type: String,
    environment: String,
    user_id: String,
    user_agent: String,
    client_ip: String,
    country_code: String,
    device_type: String,
    action: String,
    context: Context,
    product_data: ProductData,
    search_data: SearchData,
    metadata: Metadata,
    order_data: OrderData,
}

/// Generates a single payment log using the specified data lists.
fn generate_payment_log(
    user_list: &[User],
    product_list: &[Product],
    category_list: &[Category],
) -> Log {
    let random_user = get_random_element(user_list);
    let random_product = get_random_element(product_list);
    let matching_category = category_list
        .iter()
        .find(|cat| cat.id == random_product.category_id)
        .unwrap_or(&Category {
            id: "".to_string(),
            name: "".to_string(),
        });
    let mut rng = rand::thread_rng();
    let quantity = rng.gen_range(1..=5);

    Log {
        timestamp: get_random_timestamp(),
        request_id: generate_request_id(),
        log_type: "USER_ACTION".to_string(),
        environment: "production".to_string(),
        user_id: random_user.id.clone(),
        user_agent: "example user-agent".to_string(),
        client_ip: "127.0.0.1".to_string(),
        country_code: "日本".to_string(),
        device_type: "iPhone".to_string(),
        action: "ORDER_COMPLETE".to_string(),
        context: Context {
            page_url: "http://example.com/home".to_string(),
            referrer: "http://example.com".to_string(),
            session_id: "session123".to_string(),
            utm_source: "".to_string(),
            utm_medium: "".to_string(),
            utm_campaign: "".to_string(),
        },
        product_data: ProductData {
            product_id: parse_numeric_id(&random_product.id),
            product_name: random_product.name.clone(),
            product_price: random_product.price,
            quantity,
            category_id: parse_numeric_id(&matching_category.id),
            category_name: matching_category.name.clone(),
        },
        search_data: SearchData {
            keyword: "".to_string(),
            category_id: "".to_string(),
            category_name: "".to_string(),
        },
        metadata: Metadata {
            additional_info: "test action".to_string(),
        },
        order_data: OrderData {
            order_id: generate_order_id(),
        },
    }
}

/// Generates multiple payment logs.
fn generate_payment_logs(
    count: usize,
    user_list: &[User],
    product_list: &[Product],
    category_list: &[Category],
) -> Vec<Log> {
    let mut logs = Vec::with_capacity(count);
    for _ in 0..count {
        logs.push(generate_payment_log(user_list, product_list, category_list));
    }
    logs
}

/// LogMaker構造体（ログの保管のみを担当）
struct LogMaker {
    logs: Vec<Log>,
}

impl LogMaker {
    fn new() -> Self {
        LogMaker { logs: Vec::new() }
    }

    /// Adds new logs.
    fn add_logs(&mut self, new_logs: Vec<Log>) {
        self.logs.extend(new_logs);
    }
}

/// Writes logs to the given file path (newline-delimited JSON).
fn write_logs_to_file(logs: &[Log], file_path: &str) -> std::io::Result<()> {
    let mut file = File::create(file_path)?;
    for log in logs {
        let json = serde_json::to_string(log).unwrap();
        writeln!(file, "{}", json)?;
    }
    println!("Logs written to {}", file_path);
    Ok(())
}

fn main() {
    // データ定義：ユーザー、商品、カテゴリ
    let user_list = vec![
        User { id: "user001".to_string() },
        User { id: "user002".to_string() },
        User { id: "user003".to_string() },
        User { id: "user004".to_string() },
        User { id: "user005".to_string() },
        User { id: "user006".to_string() },
        User { id: "user007".to_string() },
        User { id: "user008".to_string() },
        User { id: "user009".to_string() },
        User { id: "user010".to_string() },
        User { id: "user011".to_string() },
        User { id: "user012".to_string() },
        User { id: "user013".to_string() },
        User { id: "user014".to_string() },
        User { id: "user015".to_string() },
    ];

    let product_list = vec![
        // 電化製品
        Product { id: "prod001".to_string(), name: "4Kテレビ 55インチ".to_string(), price: 89800, category_id: "cat001".to_string() },
        Product { id: "prod002".to_string(), name: "ノートパソコン".to_string(), price: 128000, category_id: "cat001".to_string() },
        Product { id: "prod003".to_string(), name: "全自動洗濯機".to_string(), price: 65000, category_id: "cat001".to_string() },
        Product { id: "prod004".to_string(), name: "電子レンジ".to_string(), price: 23800, category_id: "cat001".to_string() },
        Product { id: "prod005".to_string(), name: "掃除ロボット".to_string(), price: 45800, category_id: "cat001".to_string() },
        Product { id: "prod006".to_string(), name: "ドライヤー".to_string(), price: 12800, category_id: "cat001".to_string() },
        Product { id: "prod007".to_string(), name: "コーヒーメーカー".to_string(), price: 15800, category_id: "cat001".to_string() },
        Product { id: "prod008".to_string(), name: "空気清浄機".to_string(), price: 34800, category_id: "cat001".to_string() },
        Product { id: "prod009".to_string(), name: "タブレット".to_string(), price: 45800, category_id: "cat001".to_string() },
        Product { id: "prod010".to_string(), name: "スマートスピーカー".to_string(), price: 12800, category_id: "cat001".to_string() },
        // 書籍
        Product { id: "prod011".to_string(), name: "プログラミング入門書".to_string(), price: 2800, category_id: "cat002".to_string() },
        Product { id: "prod012".to_string(), name: "ビジネス戦略の教科書".to_string(), price: 1600, category_id: "cat002".to_string() },
        Product { id: "prod013".to_string(), name: "人気小説セット".to_string(), price: 4500, category_id: "cat002".to_string() },
        Product { id: "prod014".to_string(), name: "料理レシピ本".to_string(), price: 1800, category_id: "cat002".to_string() },
        Product { id: "prod015".to_string(), name: "歴史写真集".to_string(), price: 3800, category_id: "cat002".to_string() },
        Product { id: "prod016".to_string(), name: "語学学習テキスト".to_string(), price: 2400, category_id: "cat002".to_string() },
        Product { id: "prod017".to_string(), name: "児童書セット".to_string(), price: 5600, category_id: "cat002".to_string() },
        Product { id: "prod018".to_string(), name: "経済学の基礎".to_string(), price: 2200, category_id: "cat002".to_string() },
        Product { id: "prod019".to_string(), name: "健康医学大全".to_string(), price: 3600, category_id: "cat002".to_string() },
        Product { id: "prod020".to_string(), name: "美術作品集".to_string(), price: 4800, category_id: "cat002".to_string() },
        // 衣服
        Product { id: "prod021".to_string(), name: "ビジネススーツ".to_string(), price: 38000, category_id: "cat003".to_string() },
        Product { id: "prod022".to_string(), name: "カジュアルジャケット".to_string(), price: 15800, category_id: "cat003".to_string() },
        Product { id: "prod023".to_string(), name: "デニムパンツ".to_string(), price: 8900, category_id: "cat003".to_string() },
        Product { id: "prod024".to_string(), name: "コットンシャツ".to_string(), price: 4900, category_id: "cat003".to_string() },
        Product { id: "prod025".to_string(), name: "ニットセーター".to_string(), price: 6800, category_id: "cat003".to_string() },
        Product { id: "prod026".to_string(), name: "スポーツウェア上下".to_string(), price: 12800, category_id: "cat003".to_string() },
        Product { id: "prod027".to_string(), name: "ダウンジャケット".to_string(), price: 23800, category_id: "cat003".to_string() },
        Product { id: "prod028".to_string(), name: "レインコート".to_string(), price: 5800, category_id: "cat003".to_string() },
        Product { id: "prod029".to_string(), name: "パジャマセット".to_string(), price: 4800, category_id: "cat003".to_string() },
        // 食品
        Product { id: "prod030".to_string(), name: "高級和牛セット".to_string(), price: 28000, category_id: "cat004".to_string() },
        Product { id: "prod031".to_string(), name: "有機野菜詰め合わせ".to_string(), price: 4800, category_id: "cat004".to_string() },
        Product { id: "prod032".to_string(), name: "果物セット".to_string(), price: 5800, category_id: "cat004".to_string() },
        Product { id: "prod033".to_string(), name: "天然魚介類セット".to_string(), price: 12800, category_id: "cat004".to_string() },
        Product { id: "prod034".to_string(), name: "調味料セット".to_string(), price: 3800, category_id: "cat004".to_string() },
        Product { id: "prod035".to_string(), name: "お菓子アソート".to_string(), price: 2800, category_id: "cat004".to_string() },
        Product { id: "prod036".to_string(), name: "健康食品セット".to_string(), price: 8800, category_id: "cat004".to_string() },
        Product { id: "prod037".to_string(), name: "ドライフルーツ詰め合わせ".to_string(), price: 3200, category_id: "cat004".to_string() },
        Product { id: "prod038".to_string(), name: "高級茶葉セット".to_string(), price: 6800, category_id: "cat004".to_string() },
        Product { id: "prod039".to_string(), name: "レトルト食品セット".to_string(), price: 4200, category_id: "cat004".to_string() },
        Product { id: "prod040".to_string(), name: "オーガニックコーヒー".to_string(), price: 3600, category_id: "cat004".to_string() },
        // 家具
        Product { id: "prod041".to_string(), name: "ソファーベッド".to_string(), price: 78000, category_id: "cat005".to_string() },
        Product { id: "prod042".to_string(), name: "ダイニングセット".to_string(), price: 128000, category_id: "cat005".to_string() },
        Product { id: "prod043".to_string(), name: "本棚".to_string(), price: 45800, category_id: "cat005".to_string() },
        Product { id: "prod044".to_string(), name: "デスク".to_string(), price: 38000, category_id: "cat005".to_string() },
        Product { id: "prod045".to_string(), name: "クローゼット".to_string(), price: 52000, category_id: "cat005".to_string() },
        Product { id: "prod046".to_string(), name: "テレビボード".to_string(), price: 42000, category_id: "cat005".to_string() },
        Product { id: "prod047".to_string(), name: "チェスト".to_string(), price: 34800, category_id: "cat005".to_string() },
        Product { id: "prod048".to_string(), name: "玄関収納".to_string(), price: 28000, category_id: "cat005".to_string() },
        Product { id: "prod049".to_string(), name: "サイドテーブル".to_string(), price: 12800, category_id: "cat005".to_string() },
        Product { id: "prod050".to_string(), name: "シューズラック".to_string(), price: 8800, category_id: "cat005".to_string() },
    ];

    let category_list = vec![
        Category { id: "cat001".to_string(), name: "電化製品".to_string() },
        Category { id: "cat002".to_string(), name: "書籍".to_string() },
        Category { id: "cat003".to_string(), name: "衣服".to_string() },
        Category { id: "cat004".to_string(), name: "食品".to_string() },
        Category { id: "cat005".to_string(), name: "家具".to_string() },
    ];

    const LOG_COUNT: usize = 100;

    let generated_logs = generate_payment_logs(LOG_COUNT, &user_list, &product_list, &category_list);

    let mut log_maker = LogMaker::new();
    log_maker.add_logs(generated_logs);

    println!("Created dynamic multiple logs: {:#?}", log_maker.logs);

    let output_file_path = "order.log";
    if let Err(e) = write_logs_to_file(&log_maker.logs, output_file_path) {
        eprintln!("Error writing logs to file: {}", e);
    }
}
