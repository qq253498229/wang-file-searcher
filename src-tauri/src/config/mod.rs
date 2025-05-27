use crate::command::entity::Param;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Config {
    pub id: String,
    pub name: Option<String>,
    pub details: Option<String>,
    pub param: Param,
}
