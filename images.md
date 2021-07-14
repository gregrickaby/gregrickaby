# Images

## Resize

Resize all `.jpg` images in the current directory to 400px wide. Append `-400` to the end of the filename:

```bash
convert *.jpg -resize 400x -set filename:area "%t-%w" "%[filename:area].jpg"
```

---

## Optimize and Convert

Use Sqoosh CLI to convert to a new format:

```bash
npx @squoosh/cli *.jpg --webp
```

<https://www.npmjs.com/package/@squoosh/cli>

---
