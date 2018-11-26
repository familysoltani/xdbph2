<link rel="styleSheet" href="../styles.css" />

# نصب سرور

پس از نصب سیستم عامل ابتدا باید مشخصات شبکه را اصلاح نمود. در ابونتو ۱۸ اینکار از طریق فایل موجود در پوشه /etc/netplan انجام می‌شود. این فایل یک فایل yaml است. پس از انجام تغییرات باید آن را ذخیره و اعمال نمود:

```yaml
nameservers:
  addresses: [8.8.4.4, 8.8.8.8]
```

و برای اعمال:

```bash
sudo netplan apply
```

سپس باید بروزرسانی‌ها را انجام داد:

```bash
sudo apt-get update && sudo apt-get -y upgrade
```

دقت شود که نمی‌توان بجای apt-get از apt برای بروزرسانی استفاده کرد. ممکن است پاسخ ندهد.

اصلاح بعدی مربوط به جایگزینی پایتون ۳ با پایتون پیشفرض است:

```bash
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3 1
```

در قدم بعد بایستی postgresql را نصب نمود:

```bash
sudo apt install postgresql postgresql-contrib
```

حال با دستورات ذیل می‌توان آن را اجرا یا وضعیت سرویس آن را مشاهده نمود:

```bash
systemctl start postgresql
systemctl status postgresql
```

برای کار با آن باید با کاربر postgres وارد شد:

```bash
sudo -i -u postgres
```

و برای بازگشت به کاربر قبلی:

```bash
su - username
```

یا فرمان‌ها بدون تغییر کاربر مستقیم وارد psql شد:

```bash
sudo -u postgres psql
```

دقت شود که دستورات postgresql را باید یا با کاربر آن انجام داد و یا از sudo -u postgres قبل از آن استفاده کرد.

کاربر جدید را می‌توان به دو روش ساخت. یکی استفاده از sql است:

```sql
CREATE USER username WITH
  LOGIN
  NOSUPERUSER
  CREATEDB
  NOCREATEROLE
  INHERIT
  NOREPLICATION
  CONNECTION LIMIT -1
  PASSWORD 'username!pass';
```

و دیگری استفاده از psql:

```bash
sudo -u postgres createuser --interactive
```

در حالت عادی کاربران ساخته شده به روش psql تنها به صورت محلی قابلیت استفاده دارند. برای استفاده از راه دور باید ابتدا یک گذرواژه برای کاربر تعریف نمود. می‌توان این کار را از طریق

```sql
ALTER ROLE username WITH PASSWORD 'hu8jmn3';
```

انجام داد و یا در مد psql فرمان ذیل را تایپ کرد:

```bash
\password test_user
```

که در ادامه یک رمز را درخواست می‌کند.

جهت اتصال به این کاربر می‌توان یک دیتابیس با نام خودش تولید کرد:

```bash
sudo -u postgres createdb username
```

حال می‌توان با دستور ذیل به این دیتابیس و کاربر متصل شد:

```bash
psql -U username -d username -h 127.0.0.1 -W
```

پس از ورود دیتابیس ساخته می‌شود:

```sql
CREATE DATABASE bmik_db ALLOW_CONNECTIONS TRUE;
```

اکنون دیتابیس آماده استفاده است.

## نصب فایروال

### مرجع

[How To Set Up a Firewall with UFW on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-18-04)

### نصب سیاست‌های پیش‌فرض

اولین قدم نصب سیاست‌های پیشفرض است که تمام درخواست‌های ورودی را محدود و خروجی را باز می‌کند:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### اضافه و حذف کردن دسترسی‌ها

در ادامه برخی دسترسی‌های معمول اضافه می‌شود:

```bash
sudo ufw allow ssh
```

این دستور پورت ۲۲ را باز می‌کند. دقت شود که UFW منظور از ssh را میداند زیرا به عنوان یک سرویس در فایل /etc/services ذخیره شده است. اگر ssh جهت استفاده از پورت دیگری تنظیم شده است باید دستور را اصلاح کرد:

```bash
sudo ufw allow 2222
```

همچنین برای سایر سرویس‌ها داریم:

```bash
ufw allow 80
# OR
sudo ufw allow http
# AND
sudo ufw allow https
# OR
sudo ufw allow 443
```

یا می‌توان فعال‌سازی را برای یک Ip خاص انجام داد:

```bash
sudo ufw allow from 203.0.113.4 to any port 22
```

برای حذف یک رول می‌توان از دستور حذف با پورت یا شماره ردیف استفاده کرد:

```bash
sudo ufw delete allow http
# OR
sudo ufw delete allow 80
# OR
sudo ufw status numbered
sudo ufw delete 2
```

### فعال‌سازی

با دستور

```bash
sudo ufw enable
```

فایروال فعال می‌شود و با

```bash
sudo ufw status verbose
```

می‌توان وضعیت آن را مشاهده کرد.

## نصب FTP

### مرجع

[How To Set Up vsftpd for a User's Directory on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-vsftpd-for-a-user-s-directory-on-ubuntu-18-04)

ftp یک ابزار قدیمی است و استفاده از آن توصیه نمی‌شود. بجای آن توصیه می‌شود از sftp یا scp استفاده شود که از ssh برای ارتباط استفاده می‌کنند.

### نصب vsftpd

ابتدا لیست بسته‌ها را بروزرسانی و vsftpd را نصب می‌کنیم:

```bash
sudo apt update
sudo apt install vsftpd
```

در ادامه باید فایل پیکربندی را تغییر داد. ابتدا از آن یک پشتیبان تهیه می‌کنیم:

```bash
sudo cp /etc/vsftpd.conf /etc/vsftpd.conf.orig
```

اگر این فایل قبلا حذف شده باشد دیگر کپی نخواهد شد و باید آن را از اضافه کرد.

### تنظیمات فایروال

ابتدا باید پورت‌های ۲۰ و ۲۱ را برای ftp باز کرد و پورت 990 را برای TLS و پورت‌های ۴۰۰۰۰ تا ۵۰۰۰۰ را برای رنج پورت‌های منفعل که در فایل پیکربندی قصد داریم اضافه کنیم:

```bash
sudo ufw allow 20/tcp
sudo ufw allow 21/tcp
sudo ufw allow 990/tcp
sudo ufw allow 40000:50000/tcp
sudo ufw status
```

### آماده‌سازی دایرکتوری کاربر

توصیه می‌شود برای کار با ftp یک کاربر جدید ساخته شود بجای اینکه از کاربران جاری استفاده شود.

```bash
sudo adduser sammy
```

ftp زمانیکه دسترسی کاربر به یک پوشه محدود می‌شود امنیت بهتری خواهد داشت. این کار با chroot انجام می‌شود. زمانی که chroot برای کاربران محلی فعال شود از تغییر در پوشه خانه خود محروم می‌شوند. این برای کاربری که مخصوص ftp است مشکلی ایجاد نمی‌کند اما برای کاربران فعلی مطلوب نیست.

```bash
sudo mkdir /home/sammy/ftp
sudo chown nobody:nogroup /home/sammy/ftp
sudo chmod a-w /home/sammy/ftp
sudo ls -la /home/sammy/ftp
```

سپس یک پوشه ساخته و مالکیت آن را به کاربر می‌دهیم:

```bash
sudo mkdir /home/sammy/ftp/files
sudo chown sammy:sammy /home/sammy/ftp/files
sudo ls -la /home/sammy/ftp
```

سرانجام برای تست یک فایل را اضافه می‌کنیم:

```bash
echo "vsftpd test file" | sudo tee /home/sammy/ftp/files/test.txt
```

### پیکربندی دسترسی FTP

می‌خواهیم به یک کاربر با حساب محلی اجازه اتصال به ftp را بدهیم.

```bash
sudo nano /etc/vsftpd.conf
```

پیکربندی این فایل چنین می‌شود:

```bash
listen=NO
listen_ipv6=YES
anonymous_enable=NO
local_enable=YES
write_enable=YES
connect_from_port_20=YES
chroot_local_user=YES
user_sub_token=$USER
local_root=/home/$USER/ftp
ssl_enable=NO
pasv_enable=Yes
pasv_min_port=40000
pasv_max_port=50000
userlist_enable=YES
userlist_file=/etc/vsftpd.userlist
userlist_deny=NO
```

سرانجام باید فایل /etc/vsftpd.userlist ساخته شود:

```bash
echo "username" | sudo tee -a /etc/vsftpd.userlist
cat /etc/vsftpd.userlist
```

و برای اعمال تغییرات باید ریستارت انجام شود.

```bash
sudo systemctl restart vsftpd
```

### تست دسترسی به FTP

اکنون می‌توان به وسیله fileZilla یا winSCP به سرور متصل شد. اما این یک ارتباط خام و ناامن است. در سیستم‌های لینوکسی می‌توان با دستور ftp نیز به سرور متصل شد.

### امن کردن تراکنش‌ها

از آنجایی که FTP داده‌ها را رمز نمی کند و این شامل اطلاعات احراز هویت نیز می‌شود ما از TLS/SSL جهت فراهم‌آوری رمزنگاری استفاده می‌کنیم. اولین قدم ساخت گواهی‌نامه SSL جهت استفاده در vsftpd‌ است.

برای این منظور از openssl استفاده می‌کنیم. همچنین از -days برای آنکه آن را یکساله کنیم استفاده می‌کنیم. در همان فرمان،‌یک کلید 2048-bit RSA خصوصی را اضافه می‌کنیم. با ست کردن هر دو پرچم keyout و out به یک مقدار، کلید خصوصی و گواهینمامه از همان فایل قرار می‌گیرند.

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/vsftpd.pem -out /etc/ssl/private/vsftpd.pem
```

در ادامه تنظیمات vsftpd را باید انجام داده و آن را ریست کرد.

```bash
sudo nano /etc/vsftpd.conf
```

```
rsa_cert_file=/etc/ssl/private/vsftpd.pem
rsa_private_key_file=/etc/ssl/private/vsftpd.pem
ssl_enable=YES
allow_anon_ssl=NO
force_local_data_ssl=YES
force_local_logins_ssl=YES
ssl_tlsv1=YES
ssl_sslv2=NO
ssl_sslv3=NO
require_ssl_reuse=NO
ssl_ciphers=HIGH
```

```bash
sudo systemctl restart vsftpd
```

بدین ترتیب باید بجای FTP از SFTP یا FTP over TLS استفاده کرد.

<style>
html {
    direction: rtl;
}
code {
    direction: ltr;
}
</style>
