use crate::api::{PackageList, api_url};
use crate::error::Result;

pub async fn search(query: Option<String>, limit: u32) -> Result<()> {
    let mut url = format!("{}/packages?limit={limit}", api_url());
    if let Some(q) = query {
        url.push_str(&format!("&q={q}"));
    }

    let resp: PackageList = reqwest::get(&url).await?.json().await?;

    println!(
        "found {} packages (showing {})",
        resp.total,
        resp.data.len()
    );
    for pkg in resp.data {
        let version = pkg
            .latest_version
            .map(|v| v.version)
            .unwrap_or_else(|| "—".to_string());
        println!(
            "  {:<40} {:<10} {:<8} ↓{}",
            pkg.full_name, version, pkg.asset_type, pkg.total_downloads
        );
        println!("    {}", pkg.description);
    }
    Ok(())
}
