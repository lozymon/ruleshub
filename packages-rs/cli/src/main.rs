use clap::{Parser, Subcommand};
use ruleshub::Tool;
use std::process::ExitCode;

#[derive(Parser, Debug)]
#[command(name = "ruleshub", version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Validate a ruleshub.json manifest in the given path.
    Validate {
        #[arg(default_value = ".")]
        path: String,
        #[arg(long)]
        json: bool,
    },
    /// Print the API URL the CLI will talk to.
    Whoami,
    /// Search the registry for packages.
    Search {
        query: Option<String>,
        #[arg(short, long, default_value_t = 20)]
        limit: u32,
    },
    /// Install an asset (or pack) into the current directory.
    Install {
        name: String,
        #[arg(long)]
        version: Option<String>,
        #[arg(long, value_enum, default_value_t = Tool::ClaudeCode)]
        tool: Tool,
        #[arg(long, default_value = ".")]
        output: String,
        #[arg(long)]
        dry_run: bool,
        #[arg(long)]
        force: bool,
    },
    /// Check installed packages for newer versions.
    Outdated {
        #[arg(long, default_value = ".")]
        output: String,
        #[arg(long)]
        json: bool,
    },
    /// Update installed packages to their latest versions.
    Update {
        name: Option<String>,
        #[arg(long, default_value = ".")]
        output: String,
        #[arg(long)]
        dry_run: bool,
    },
    /// Publish the package in the current directory.
    Publish {
        /// API token (or set RULESHUB_TOKEN env var).
        #[arg(long)]
        token: Option<String>,
        /// Validate and preview without publishing.
        #[arg(long)]
        dry_run: bool,
    },
}

#[tokio::main]
async fn main() -> ExitCode {
    let cli = Cli::parse();

    let result: ruleshub::Result<bool> = match cli.command {
        Commands::Validate { path, json } => match ruleshub::validate(&path).await {
            Ok(report) => {
                if json {
                    ruleshub::print_report_json(&report).ok();
                } else {
                    ruleshub::print_report_human(&report);
                }
                Ok(report.valid)
            }
            Err(e) => Err(e),
        },
        Commands::Whoami => {
            println!("api: {}", ruleshub::api_url());
            Ok(true)
        }
        Commands::Search { query, limit } => ruleshub::search(query, limit).await.map(|_| true),
        Commands::Install {
            name,
            version,
            tool,
            output,
            dry_run,
            force,
        } => ruleshub::install(&name, version, tool, &output, dry_run, force)
            .await
            .map(|_| true),
        Commands::Outdated { output, json } => ruleshub::outdated(&output, json).await,
        Commands::Update {
            name,
            output,
            dry_run,
        } => ruleshub::update(name, &output, dry_run).await.map(|_| true),
        Commands::Publish { token, dry_run } => {
            ruleshub::publish(token, dry_run).await.map(|_| true)
        }
    };

    match result {
        Ok(true) => ExitCode::SUCCESS,
        Ok(false) => ExitCode::FAILURE,
        Err(err) => {
            eprintln!("error: {err}");
            ExitCode::FAILURE
        }
    }
}
