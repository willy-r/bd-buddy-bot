# 📒 Changelog & Conventional Commits Guide

This project uses an **automated changelog system** powered by [Release Please](https://github.com/googleapis/release-please-action) and follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

---

## 📦 How the changelog system works

- Every time changes are pushed to the `main` branch, a GitHub Action is triggered.
- If the commits follow the proper format, it will create a **Release Pull Request** containing:
  - A new **version tag** (`v1.0.1`, `v1.1.0`, etc.)
  - An **auto-generated changelog**
  - A new **release published** in the [Releases](./releases) section

---

## ✍️ Commit message format (Conventional Commits)

Using Conventional Commits ensures that changes are categorized and that the changelog generation is accurate.

### 🔧 Basic format:

```bash
<type>: <short description>
```

### 📋 Supported types:

| Type       | Description                                   |
|------------|-----------------------------------------------|
| `feat`     | Adds a new feature                            |
| `fix`      | Fixes a bug                                   |
| `chore`    | Maintenance tasks, no user-facing changes     |
| `docs`     | Documentation-only changes                    |
| `refactor` | Code refactoring without feature changes      |
| `test`     | Adds or updates tests                         |
| `style`    | Code formatting (no logic changes)            |
| `perf`     | Performance improvements                      |

### 🧪 Valid commit examples:

```bash
feat: add birthday reminder command
fix: fix timezone issue when listing birthdays
docs: update README with setup instructions
chore: update project dependencies
```

---

## 🚀 How to trigger a release

1. Make commits using the correct format above.
2. Merge your changes into the `main` branch.
3. GitHub Actions will automatically open a release PR with the generated changelog.
4. Once merged, a new release and version tag will be published automatically.

---

## 📘 References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Release Please](https://github.com/googleapis/release-please)
- [Semantic Versioning](https://semver.org/)
