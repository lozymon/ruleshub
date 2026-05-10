use crate::commands::install::{InstallOptions, install_inner};
use crate::error::Result;
use crate::lockfile::{InstalledEntry, read_lockfile};
use crate::tool::Tool;
use std::path::Path;

pub async fn update(
    name: Option<String>,
    output: &str,
    dry_run: bool,
    verbose: bool,
) -> Result<()> {
    let output_path = Path::new(output);
    let lock = read_lockfile(output_path);

    let entries: Vec<(String, InstalledEntry)> = match name {
        Some(n) => match lock.packages.get(&n) {
            Some(e) => vec![(n.clone(), e.clone())],
            None => {
                println!("{n} is not installed.");
                return Ok(());
            }
        },
        None => lock
            .packages
            .iter()
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect(),
    };

    if entries.is_empty() {
        println!("No packages installed.");
        return Ok(());
    }

    let opts = InstallOptions {
        dry_run,
        force: true,
        verbose,
        continue_on_error: false,
    };
    for (pkg_name, entry) in entries {
        let tool: Tool = entry.tool.parse()?;
        println!("checking {pkg_name}…");
        install_inner(pkg_name, None, tool, output.to_string(), opts).await?;
    }

    Ok(())
}
