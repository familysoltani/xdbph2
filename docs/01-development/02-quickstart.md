<link rel="styleSheet" href="../styles.css" />

# شروع سریع

## backend

برای نصب سریع زیرساخت از برنامه pycharm پروژه django‌ را انتخاب می‌کنیم.
اولین برنامه برنامه‌ی حساب کاربری است.

```
> location: phase2_path/backend
> env: phase2_path/pyenv
> app: account
```

دقت شود که برای فعال‌سازی محیط مجازی در ویندوز نباید source را وارد کرد:
‍‍‍

```
pvenv/Scripts/activate
```

برای رهایی از cors می‌توان کتابخانه corsheaders استفاده کرد اما دقت شود که اگر در برنامه خطایی رخ دهد بجای نمایش خطا پیام ذیل صادر می‌شود:

```
Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/users' from origin 'http://localhost:4200' has been blocked by CORS policy
```
