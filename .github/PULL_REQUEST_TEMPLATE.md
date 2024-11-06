**Pull Request Title Rules**

Pull request format must respect this format:

```
<type>(<scope>, <scope>...): <Notion ID> or "sentry" - <description>
```

Allowed types: `feat`, `fix`, `refactor`, `chore`.
Allowed scopes: `release`, `app`, `admin`, `misc`, `api`, `all`, `github`, `terraform`, `kb`, `lib`.

Notion ID, followed by a `-` is **mandatory** on types `refactor`, `feat` and `fix`.

_If you really need to bypass the pull request title validation, you can add the `bypass title` label to you PR._

Examples of valid PR titles:

- `chore(release): New version 1.3.3.7`
- `refactor(api): 1789 - Removed monarchy from codebase`
- `fix(api, app, admin): 1981 - User cannot delete each other accounts anymore.`
- `fix(api): sentry - Implement capture or fix a bug.`

**Description**

<!-- Explain the **motivation** for making this change. What existing problem does the pull request solve? screenshot? -->

**Todo**

<!--
- [ ] ${{ Todo item 1 }}
- [ ] ${{ Todo item 2 }}
-->

**Checklist**

- [ ] **⚠️ My code can have side-effects on other part of the code-base**
- [ ] I have added the Plausible tags/events
- [ ] I have performed a self-review of my code (and removed console.log)

**Ticket / Issue**

<!-- If you have a Notion Ticket / GitHub Issue -->
<!-- Fixes [Notion ticket #123](https://notion.so/abc) -->

**Testing instructions**

<!--
    Explain how another dev can test this PR. Create a workflow using checkboxes to explain how to run your code and the expected outputs:

    ${{ Test the following }}
    - [x] ${{ QA Scenario 1 }}
    - [x] ${{ QA Scenario 2 }}
    - [x] ${{ QA Scenario 3 }}
-->
