<link rel="styleSheet" href="../styles.css" />

# نصب وب سرور

## نصب پایتون عادی

خود پایتون به طور پیش‌فرض نصب است و تنها باید یک پیوند به آن ایجاد کرد:

```bash
update-alternatives --install /usr/bin/python python /usr/bin/python3 1
```

جهت نصب pip باید آن را ابتدا اضافه نمود:

```bash
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
sudo python get-pip.py
```

## نصب آخرین نگارش پایتون و محیط مجازی

### مراجع

[Install Python 3.7.0 on Ubuntu 18.04 / Debian 9.5](https://www.admintome.com/blog/install-python-3-7-0-on-ubuntu-18-04/)

[How to Install Python 3.7.0 on Ubuntu, Debian and LinuxMint](https://tecadmin.net/install-python-3-7-on-ubuntu-linuxmint/)

برای نصب آخرین نگارش باید ابتدا آن را دانلود کرد:
این یک فایل سورس است و باید کامپایل شود. برای کامپایل به نصب کامپایلر نیاز است:
اگر بسته‌ای کم باشد باید آن را نصب کرده و دوباره دستوارت make بالا را اجرا نمود. بسته‌های لازم:

```bash
apt update && apt upgrade -y
apt install build-essential -y
apt install libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev -y
wget https://www.python.org/ftp/python/3.7.1/Python-3.7.1.tgz
tar -xvf Python-3.7.1.tgz
cd Python-3.7.1/
./configure --enable-optimizations
make
make install
```

پس از نصب اندازه این پوشه شدیدا افزایش پیدا می‌کند. با دستور ذیل می‌توان سایز پوشه را بدست آورد:

```bash
du -hs Python-3.7.1
```

برای نصب بجای make و make install می‌توان از sudo make altinstall استفاده کرد که از جایگزینی فایل باینری /usr/bin/python جلوگیری شود.

از پایتون ۳.۳ به بعد محیط مجازی داخل پایتون گنجانده شده است و پس از نصب یک محیط pip در دسترس خواهد بود:

```bash
cd ../
mkdir venvs
python3 -m venv py37test
source py37test/bin/activate
pip --version
```

## نصب جنگو

پس از نصب پایتون باید محیط مجازی را ساخته و در آن ابزارهای لازم را نصب کرد:

```bash
python3 -m venv bmik_virtual_env
source bmik_virtual_env/bin/activate
pip install Django
pip install django-markdownx
pip install jdatetime
pip install psycopg2-binary
```

دقت شود که با نصب این سه بسته بسته‌های دیگری نیز نصب می‌شود:

```bash
pip freeze
# Output
Django==2.1.3
django-markdownx==2.0.26
jdatetime==3.0.2
Markdown==3.0.1
Pillow==5.3.0
psycopg2==2.7.6.1
pytz==2018.7
```

## نصب برنامه

سپس فایل‌های پروژه را زیپ کرده و از طریق ftp ارسال و در پوشه مربوط به پروژه باز می‌کنیم. دقت شود که برای باز کردن زیپ باید unzip نصب شود.

```bash
sudo apt install unzip
unzip /home/bmikftp/ftp/files/bmik_project.zip -d bmik_project
```

در ادامه باید ابتدا فایل settings.py را تغییر داد. سپس دستور makemigrations را اجرا نمود و در آخر migrate را اجرا کرد.

برای فایل‌های استاتیک نیز حتما باید collectstatic را اجرا نمود.

برای اجرای برنامه می‌توان یک فایل run.sh با محتوای ذیل تهیه کرد:

```bash
#!/bin/bash
source bmik_virtual_env/bin/activate
python --version
python bmik_project/manage.py runserver 17.62.0.132:80
```

و دسترسی اجرا به آن داد:

```bash
#!/bin/bash
chmod +x bmik_run.sh
```

سپس کافیست آنر را اجرا کرد. چون باید به پورت ۸۰ دسترسی داشته باشد حتما باید با کاربر مدیر اجرا گردد:

```bash
sudo ./bmik_run.sh
```

در این حالت برنامه اجرا می‌شود اما فایل‌های استاتیک برای کاربر فرستاده نمی شوند. برای فایل‌های استاتیک باید webserver را نصب نمود

## نصب وب سرور

### مرجع

[Setting up Django and your web server with uWSGI and nginx](https://uwsgi.readthedocs.io/en/latest/tutorials/Django_and_nginx.html)

ساخت فایل bmik_nginx.conf در محل پروژه:

```conf
# bmik_nginx.conf

# the upstream component nginx needs to connect to
upstream django {
    server unix:///home/soltani/bmik-97-01/bmik_project/bmik_project.sock; # for a file socket
    # server 127.0.0.1:8001; # for a web port socket (we'll use this first)
}

# configuration of the server
server {
    # the port your site will be served on
    listen      80;
    # the domain name it will serve for
    server_name 17.62.0.132 bmik.kr.bmi.ir; # substitute your machine's IP address or FQDN
    charset     utf-8;

    # max upload size
    client_max_body_size 75M;   # adjust to taste

    # Django media
    location /media  {
        alias /home/soltani/bmik-97-01/bmik_project/media;  # your Django project's media files - amend as required
    }

    location /static {
        alias /home/soltani/bmik-97-01/bmik_project/statics; # your Django project's static files - amend as required
    }

    # Finally, send all non-media requests to the Django server.
    location / {
        # uwsgi_pass  django;
        proxy_pass  http://127.0.0.1:8001;
        include     /home/soltani/bmik-97-01/bmik_project/uwsgi_params; # the uwsgi_params file you installed
    }
}
```

توجه شود که برای server_name بایستی هر دو مقدار ip و نام dns را قرار دارد تا سرور به هر دو گزینه به درستی پاسخ دهد.

ساخت پیوند به آن در پوشه سایت‌های nginx:

```bash
sudo ln -s ~/bmik-97-01/bmik_project/bmik_nginx.conf /etc/nginx/sites-enabled/
```

و در نهایت ریست کردن سرور

```bash
sudo /etc/init.d/nginx restart
```

حال برنامه را روی سوکت اجرا می‌کنیم:

```bash
uwsgi --socket bmik_project.sock --module bmik_project.wsgi --chmod-socket=664
sudo /etc/init.d/nginx restart
```

با توجه به اینکه uwsgi به مشکل بر می‌خورد از proxy استفاده شد. بنابراین اجرای سرور نیز باید به صورت عادی باشد.

دقت شود که این سرویس با بستن putty حذف می‌شود. بنابراین باید آن را به صورت سرویس تعریف کرد.

## ساخت سرویس برنامه

### مرجع

[How to automatically execute shell script at startup boot on systemd Linux](https://linuxconfig.org/how-to-automatically-execute-shell-script-at-startup-boot-on-systemd-linux)

### ساخت Systemd service unit

برای شروع کار باید فایل شروع home-size-check.service را ساخته و در دایرکتوری /etc/systemd/system/ قرار داد.
برای مثال کد ذیل:

```bash
[Unit]
After=nginx.service

[Service]
ExecStart=/usr/local/bin/home-size-check.sh

[Install]
WantedBy=default.target
```

### ساخت کد shell شروع

در قدم بعدی باید کد ساخته شده را که در ExecStart مشخص شده است را اجرا نمود.

```bash
#!/bin/bash

#date > /root/disk_space_report.txt
#du -sh /home/ >> /root/disk_space_report.txt
echo Your home directory size:
echo `du -sh /home/`
```

### پیکربندی و نصب

قبل از ریست کردن سیستم باید کد خود را قابل اجرا کنیم:

```bash
chmod 744 /usr/local/bin/home-size-check.sh
```

سپس آن را فعال و قابل اجرا در زمان بوت می‌کنیم:

```bash
chmod 664 /etc/systemd/system/home-size-check.service
systemctl daemon-reload
systemctl enable home-size-check.service
```

برای تست می‌توان کد ذیل را اجرا کرد:

```bash
systemctl start home-size-check.service
# cat /root/disk_space_report.txt
```

و برای پروژه bmik داریم:

1:

```bash
sudo nano /usr/local/bin/bmik-soltani-run.sh
```

2:

```bash
#!/bin/bash
source /home/soltani/bmik-97-01/bmik_virtual_env/bin/activate
python /home/soltani/bmik-97-01/bmik_project/manage.py runserver 127.0.0.1:8001
```

3:

```bash
sudo chmod 744 /usr/local/bin/bmik-soltani-run.sh
```

4:

```bash
sudo nano /etc/systemd/system/bmik-soltani-run.service
```

5:

```bash
[Unit]
After=postgresql.service

[Service]
ExecStart=/usr/local/bin/bmik-soltani-run.sh

[Install]
WantedBy=default.target
```

6:

```bash
sudo chmod 664 /etc/systemd/system/bmik-soltani-run.service
sudo systemctl daemon-reload
sudo systemctl enable bmik-soltani-run.service
sudo systemctl start bmik-soltani-run.service
```

برای مشاهده لیست سرویس‌ها می‌توان دستور systemctl list-units را اجرا کرد. دقت شود که سرویس جدید نباید failed باشد:

```bash
systemctl list-units | grep bmik
# Output
bmik-soltani-run.service    loaded active running    bmik-soltani-run.service
# UNIT                        LOAD   ACTIVE   SUB      DESCRIPTION
```

<style>
html {
    direction: rtl;
}
code {
    direction: ltr;
}
</style>
