use crate::command::entity::Param;

pub fn is_invalid(param: &Param) -> bool {
    let search_text = param.text.as_ref().unwrap();
    if search_text.trim().len() == 0 {
        return true;
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::entity::SearchHandler;
    use crate::search::search_files;
    use crate::utils::init_logger;
    #[test]
    #[ignore]
    fn test_validator() -> anyhow::Result<()> {
        init_logger();
        let handler = SearchHandler::new(None);
        let mut param = Param::default();
        param.text = Some(String::from(""));
        param.add_includes("~".to_string());
        search_files(&param, &handler)?;
        Ok(())
    }
}
