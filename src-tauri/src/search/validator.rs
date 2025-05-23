use crate::command::entity::Param;
use crate::search::refines::is_refines_valid;

pub fn is_invalid(param: &Param) -> bool {
    let no_search_text = param.text.trim().len() == 0;
    let is_refines_valid = is_refines_valid(param);
    if no_search_text && !is_refines_valid {
        return true;
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::search::handler::SearchHandler;
    use crate::search::search_files;
    use crate::utils::init_logger;
    #[test]
    #[ignore]
    fn test_validator() -> anyhow::Result<()> {
        init_logger();
        let mut handler = SearchHandler::new(None);
        let mut param = Param::default();
        param.add_includes("~".to_string());
        search_files(&param, &mut handler)?;
        Ok(())
    }
}
