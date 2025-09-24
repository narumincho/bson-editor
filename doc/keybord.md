# キーボードでの操作

## 移動系

| キー操作                  | 動作                 | 識別子              |
| ------------------------- | -------------------- | ------------------- |
| **E**                     | 子要素の先頭へ移動   | `moveToFirstChild`  |
| **Shift+E / Shift+Enter** | 子要素の末尾へ移動   | `moveToLastChild`   |
| **Q**                     | 親要素へ移動         | `moveToParent`      |
| **W / ↑**                 | 表示の上の要素へ移動 | `moveToPrevVisible` |
| **S / ↓**                 | 表示の下の要素へ移動 | `moveToNextVisible` |
| **A / ←**                 | 表示の左の要素へ移動 | `moveToLeft`        |
| **D / →**                 | 表示の右の要素へ移動 | `moveToRight`       |

# 編集系

| キー操作                     | 動作                     | 識別子           |
| ---------------------------- | ------------------------ | ---------------- |
| **Enter**                    | 選択要素を文字列編集開始 | `startTextEdit`  |
| **Shift+Enter / Ctrl+Enter** | 編集を確定               | `commitTextEdit` |
| **Esc**                      | 編集をキャンセル         | `cancelTextEdit` |
