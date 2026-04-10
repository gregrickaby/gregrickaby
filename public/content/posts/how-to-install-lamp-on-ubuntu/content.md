---
title: "How To: Install LAMP on Ubuntu"
slug: "how-to-install-lamp-on-ubuntu"
date: "2013-05-19T08:12:44"
modified: "2025-12-16T11:27:57"
type: "post"
description: "A laundry list of commands to help you install a LAMP stack on Ubuntu+."
featuredImage: "./2013-11-10-16.25.26.jpg"
categories: ["Code"]
tags: ["hosting", "how to", "snippets", "ubuntu"]
---

My brother called to talk about moving his company's web development and testing environment in-house. They had already downloaded Ubuntu but didn't know how to get Apache, MySQL, or PHP installed. I sent him one command and 5 minutes later, they had a fully functional LAMP stack running.

> **THIS POST IS VERY OLD.** There are better resources out there, like the [DigitalOcean guide to installing Apache on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-install-the-apache-web-server-on-ubuntu-22-04).

Below is a laundry list of commands to help you configure the perfect Ubuntu server.

**Last Update:** 12/16/2019 - local copy and user permission updates

### First things first: update

```bash
sudo apt-get update && sudo apt-get upgrade
```

### LAMP Stack (Apache, Mysql, PHP)

This will install the LAMP stack in one command. (Note: this will not include the latest versions of things, but is the easiest way. See below to obtain bleeding edge things)

```bash
sudo apt-get install lamp-server^
```

### PHP 7.1

```bash
sudo apt-get install python-software-properties
sudo add-apt-repository ppa:ondrej/php
sudo apt-get update
sudo apt-get install -y php7.1
```

[http://askubuntu.com/questions/705880/how-to-install-php-7](http://askubuntu.com/questions/705880/how-to-install-php-7)

### Apache 2.4+

```bash
sudo add-apt-repository ppa:ondrej/apache2
sudo apt-get update
sudo apt-get install apache2
```

### MySQL 5.7+

```bash
sudo add-apt-repository -y ppa:ondrej/mysql-5.7
sudo apt-get update
sudo apt-get install mysql-server-5.7
```

### NGINX

[NGINX](http://nginx.org/) is a free, open-source, high-performance HTTP server and reverse proxy, as well as an IMAP/POP3 proxy server.

```bash
sudo apt-get install nginx
```

NGINX doesn't start on its own, so:

```bash
sudo service nginx start
```

Learn about [configuring NGINX as a front-end proxy](https://www.digitalocean.com/community/articles/how-to-configure-nginx-as-a-front-end-proxy-for-apache) with Apache.

### phpMyAdmin

[phpMyAdmin](http://www.phpmyadmin.net/home_page/index.php) allows you to manage your MySQL Database via web browser.

```bash
sudo apt-get install phpmyadmin
```

Choose Apache and then YES for dbconfig-common. If you ever need to edit phpMyAdmin config:

```bash
sudo nano /etc/dbconfig-common/phpmyadmin.conf
```

### Webmin

[Webmin](http://www.webmin.com/) is an open-source server management tool much like cPanel.

```bash
sudo nano /etc/apt/sources.list
```

Scroll to the bottom and paste the following lines then save:

```
deb http://download.webmin.com/download/repository sarge contrib
deb http://webmin.mirror.somersettechsolutions.co.uk/repository sarge contrib
```

Import the key:

```bash
wget http://www.webmin.com/jcameron-key.asc
sudo apt-key add jcameron-key.asc
```

Update the sources list:

```bash
sudo apt-get update
```

Run the install:

```bash
sudo apt-get install webmin
```

Start Webmin:

```bash
sudo /etc/webmin/start
```

When it's finished, open Firefox or Chrome and type:

- `http://localhost:10000/`
- `http://your-server-ip:10000/` (if on a network)

If you've installed a fresh copy of Ubuntu (or if you don't know your password) you can set a new one:

```bash
sudo passwd ubuntu
```

You'll be prompted to enter your new password twice. Now, you can login to Webmin.

### ProFTPd

[ProFTPd](http://www.proftpd.org/) is a high-performance FTP server.

```bash
sudo apt-get install proftpd
```

(I always select "standalone")

**Turn on Passive FTP via Webmin:** Servers -> ProFTPD server -> Virtual Servers -> Default Server -> Networking Options

- Masquerade as address = your-server-outside-ip
- PASV Port Range: 1024-1088

### Sendmail

```bash
sudo apt-get install sendmail
```

### PostFix Mail

```bash
sudo apt-get install postfix
```

Select "Internet Site" and then enter the domain name you want the Reverse DNS entry to be.

**BTW:** To avoid your server being blacklisted, get a reverse DNS entry!

### Alternative PHP Cache (APC)

[APC](http://us1.php.net/apc/) is a PHP opcode cacher and works by caching PHP objects, functions, and database queries into your server's RAM. If you run a WordPress website, it takes full advantage of APC out-of-the-box. See my post on [The Perfect APC Configuration](https://gregrickaby.com/the-perfect-apc-configuration/). Note, APC [is no longer available](https://gregrickaby.com/wordpress-with-apache-2-4-and-php-5-5/) in PHP 5.5+ as it's now called [opcache](http://us2.php.net/opcache).

```bash
sudo apt-get install php-apc
```

By default, Ubuntu will install this from a repository that has an outdated version. To install the latest version of APC:

```bash
sudo apt-get install make
sudo apt-get install libpcre3-dev
sudo apt-get install php-pear
sudo pecl install apc
sudo /etc/init.d/apache2 restart
```

Uninstall APC:

```bash
sudo pecl uninstall apc
```

### Memcached

[Memcached](http://memcached.org/) is a high-performance, distributed memory object caching system. However, it can work together with multiple servers (unlike APC).

```bash
sudo apt-get install memcached
sudo apt-get install php-pear
sudo pecl install memcache
```

Check to see if Memcached is running:

```bash
ps aux | grep memcached
```

### Fail2Ban

[Fail2Ban](http://www.fail2ban.org/) scans log files (e.g. `/var/log/apache/error_log`) and automatically bans IPs that show malicious signs for exploits.

```bash
sudo apt-get install fail2ban
```

### RSYNC

[RSYNC](http://rsync.samba.org/) is an open source utility that provides fast incremental file transfer.

```bash
sudo apt-get install rsync
```

Server-to-server transfers with RSYNC:

```bash
rsync -zvr /path/to/local/folder user@server.com:path/to/remote/folder
```

### ImageMagick

[ImageMagick](http://www.imagemagick.org/) is a software suite to create, edit, compose, or convert bitmap images.

```bash
sudo apt-get install imagemagick
```

### Image Optimization

First, install both [jpegoptim](https://github.com/tjko/jpegoptim) and [optipng](http://optipng.sourceforge.net/).

```bash
sudo apt-get install jpegoptim optipng
```

CD into a directory that has images and type:

```bash
jpegoptim *.jpg -p -v -t -T 10
```

Optimize PNGs:

```bash
optipng *.png
```

### Icecast2

[Icecast](http://www.icecast.org/) is a streaming audio server. If you ever wanted to have your own web radio station (like Shoutcast) this is the software.

```bash
sudo apt-get install icecast2
```

Configure Icecast2. Mainly, setting up your passwords and default port.

```bash
sudo nano /etc/icecast2/icecast.xml
```

Enable init.d script. Scroll to the bottom and change `enable=true`:

```bash
sudo nano /etc/default/icecast2/
```

Start icecast2:

```bash
sudo /etc/init.d/icecast2 start
```

If you left the default port as 8000 then you can view your Icecast2 Server at `http://your-server.com:8000/`.

### Munin

[Munin](http://munin-monitoring.org/) is a networked resource monitoring tool that can help analyze resource trends and "what just happened to kill our performance?" problems.

```bash
sudo apt-get install php-cli
```

Now, this is a single server setup, so let's install munin and munin-node:

```bash
sudo apt-get install munin munin-node
```

Configure Munin:

```bash
sudo nano /etc/munin/munin.conf
```

The first thing you should see is the operating directories. We need to change one of them:

```
# dbdir /var/lib/munin
# htmldir /var/cache/munin/www
# logdir /var/log/munin
# rundir /var/run/munin
```

to:

```
# dbdir /var/lib/munin
htmldir /var/www/munin
# logdir /var/log/munin
# rundir /var/run/munin
```

Now let's edit apache.conf:

```bash
sudo nano /etc/munin/apache.conf
```

Delete everything inside apache.conf and just add:

```
Alias /munin /var/www/munin
```

Move the web files to `/var/www/munin`:

```bash
sudo mv /var/cache/munin/www/ /var/www/munin
```

Set permissions:

```bash
sudo chown munin.munin -R /var/www/munin
```

Restart Munin:

```bash
sudo /etc/init.d/munin-node restart
```

Finally, restart Apache:

```bash
sudo /etc/init.d/apache2 restart
```

Then visit `http://your-server.com/munin`.

### Cacti

[Cacti](http://www.cacti.net/) graphical server monitor provides a fast poller, advanced graph templating, multiple data acquisition methods, and user management features out of the box.

```bash
sudo apt-get install cacti-spine
```

Choose YES for dbconfig-common and Apache2. When finished you need to configure at `http://your-server-ip-address/cacti`. Default user and password: `admin` / `admin`.

Remove cacti:

```bash
sudo apt-get remove cacti
```

### BMON

[bmon](http://www.carisma.slowglass.com/~tgr/bmon/) is a bandwidth monitor capable of retrieving statistics from various input modules.

```bash
sudo apt-get install bmon
```

When it's finished installing:

```bash
bmon
```

### Zip and Unzip

In my experience ZIP is great for creating archives for sharing via email or ftp. It's a universal format that almost everyone can open. I would NOT use ZIP for file backups. For large backups, see 7ZIP or TAR below.

```bash
sudo apt-get install zip
```

Zip up a folder:

```bash
zip uploads-backup.zip /wp-content/uploads
```

Unzip (extract) an archive:

```bash
unzip uploads-backup.zip /wp-content/uploads
```

### 7ZIP

7ZIP is a very popular archiving program with excellent compression. Plus, it's open source and supports multiple operating systems.

```bash
sudo apt-get install p7zip
```

Create an archive:

```bash
7za a uploads-backup.7z /wp-content/uploads
```

Extract an archive:

```bash
7za e uploads-backup.7z /wp-content/uploads
```

### TAR (Tape Archive)

TAR is the preferred way to handle file backups. The maximum allowed file size only depends on your hard drive. A disk formatted with FAT32 only allows 2GB. You can also compress TAR using GZIP or BZ2.

```bash
tar -cvf uploads-backup.tar /wp-content --exclude='uploads/*'
```

GZIP - good compression, very fast. Note: `.tar.gz` and `.tgz` are the same:

```bash
tar -cvzf uploads-backup.tgz /wp-content --exclude='uploads/*'
```

BZ2 - excellent compression, but slower. Works best archiving a smaller directory. Note: `.tar.bz2` and `.tbz` are the same:

```bash
tar -cvfj plugins-backup.tbz /wp-content --exclude='uploads/*'
```

Untar (extract) an archive and if tarball already contains a directory name, strip it:

```bash
tar -xvf -backup.tar -C /DESTINATION/FOLDER --strip-components=1
```

If you want to tarball the directory you're currently in with gzip:

```bash
tar -cvzf backup.tar.gz .
```

### Other handy commands

View all running services:

```bash
service --status-all
```

Create a MySQL database backup:

```bash
mysqldump --databases db1 db2 db3 > database_backup.sql
```

Restart PHP 7.0:

```bash
sudo restart php7.0-fpm
```

Move files from one directory to another:

```bash
mv -v /source-dir/* /destination-dir/
```

Copy files from one directory to another:

```bash
cp -a /source-dir/. /destination-dir/
```

Note: You may need to reset permissions since they will be copied over also.

```bash
sudo chmod -R 775 /PATH/TO/FOLDER
sudo chown -R www-data:www-data /PATH/TO/FOLDER
```

Set the server timezone:

```bash
sudo dpkg-reconfigure tzdata
```

Add a user to the list of sudoers (you have to be logged in as root, or know the sudo password):

```bash
sudo adduser username sudo
```

Download files:

```bash
wget http://example.com/wp-content/uploads/uploads-backup.tar
```

Local-to-server transfers with SCP:

```bash
scp path/to/local-file user@remote-server.com:/path/to/server/folder
```

Server-to-local transfers with SCP (transfer entire directories):

```bash
scp -r user@remote-server.com:/path/to/server/folder /path/to/local/folder
```

Server-to-local transfers with SCP (transfer single file):

```bash
scp user@remote-server.com:/path/to/server/file /path/to/local/folder
```

Server-to-server transfers with SCP:

```bash
scp -P 22 -r user@remote-server.com:path/to/remote/folder path/to/local/folder
```

Server-to-server transfer with SCP into the current directory (read more about [SCP](https://help.ubuntu.com/community/SSH/TransferFiles)):

```bash
scp -P 22 -r user@remote-server.com:path/to/remote/folder .
```

List size of directories:

```bash
du -a -h --max-depth=1 | sort -hr
```

Set a password:

```bash
sudo passwd ubuntu
```

### Edit PHP.ini

```bash
sudo nano /etc/php5/apache2/php.ini
```

Restart Apache:

```bash
sudo /etc/init.d/apache2 restart
```

### Set Recursive Permissions for your websites directory

```bash
sudo chmod -R 775 /PATH/TO/FOLDER
sudo chown -R www-data:www-data /PATH/TO/FOLDER
```

### Block IP address using IPTABLES

Single IP:

```bash
sudo iptables -I INPUT -s 192.168.100.1 -j DROP
```

IP Range:

```bash
sudo iptables -I INPUT -s 192.168.100.0/24 -j DROP
```

You can also manage IPTABLES (the Linux firewall) via Webmin under Networking -> Linux Firewall.

### Manage packages

```bash
sudo apt-get update && sudo apt-get upgrade
sudo apt-get autoremove
```

### Remove LAMP

```bash
sudo apt-get purge libapache2-mod-auth-mysql phpmyadmin
sudo apt-get purge mysql-server mysql-server-5.1 mysql-server-core-5.1
sudo apt-get purge apache2 apache2-mpm-prefork apache2-utils apache2.2-bin apache2.2-common libapache2-mod-php5
sudo apt-get autoremove
```

### Serve your websites from an EBS volume

This practice has saved my butt on more than one occasion. Rather than use the given storage attached to the EC2 instance, I always create a 1TB EBS volume and mount it as `/public_html/`. That way, if your EC2 instance crashes, your web site files will not.

For this, we'll assume our attached EBS volume is `/xvdf/`.

Check out the [official documentation](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-using-volumes.html) from Amazon AWS.

First you must be logged in as root:

```bash
su
```

Make sure you're in the file system root:

```bash
cd
```

Now, let's list all the attached drives. You should see `/dev/xvda1`, `/dev/xvdb`, `/dev/xvdf/` etc.:

```bash
sudo fdisk -l
```

Let's make a directory (such as `/public_html/`):

```bash
mkdir /public_html/
```

Finally, let's mount our EBS volume:

```bash
mount -t ext4 /dev/xvdf /public_html/
```

Now you can serve your websites from an EBS volume!

### Benchmark the CPU

```bash
for i in {0..10000}; do for j in {0..1000}; do :; done; done
```

### More resources

- [What is Amazon EC2?](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html) (official user guides for Amazon AWS)
- [Setup Virtual Hosts in Webmin](https://gregrickaby.com/2011/06/how-to-create-virtual-servers-in-webmin-for-apache.html)
- [http://www.ubuntugeek.com/step-by-step-ubuntu-11-04-natty-lamp-server-setup.html](http://www.ubuntugeek.com/step-by-step-ubuntu-11-04-natty-lamp-server-setup.html)
- [http://www.howtoforge.com/ubuntu_lamp_for_newbies](http://www.howtoforge.com/ubuntu_lamp_for_newbies)
- [http://www.techtickle.com/how-to-setup-lamp-on-ubuntu.html](http://www.techtickle.com/how-to-setup-lamp-on-ubuntu.html)
- [List of PHP accelerators](http://en.wikipedia.org/wiki/List_of_PHP_accelerators)
- [Distributed Caching with Memcached](http://www.linuxjournal.com/article/7451)
- [Run your own webradio station with Icecast](http://www.howtoforge.com/linux_webradio_with_icecast2_ices2)
- [How to recover a Linux EC2 Instance after being locked out](http://www.wifiz.co.uk/content/how-recover-linux-ec2-amazon-instance-lost-ssh-access-or-locked-out)
- [Install LAMP on Amazon EC2](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/install-LAMP.html)
- [Install and configure Cacti Monitor Tool in Ubuntu](http://www.ubuntugeek.com/install-and-configure-cacti-monitoring-tool-in-ubuntu-9-10-karmic-server.html)
- [Install NGINX instead of Apache](http://wiki.nginx.org/Install#Official_Debian.2FUbuntu_packages)
- [Install/Setup WordPress on Amazon EC2](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/hosting-wordpress.html)
- [RSYNC for transfers](http://www.cyberciti.biz/tips/linux-use-rsync-transfer-mirror-files-directories.html)
- [RSYNC commands](http://www.comentum.com/rsync.html)
- [Using Fail2Ban with IP Tables](http://www.the-art-of-web.com/system/fail2ban/)
- [http://www.tecmint.com/optimize-and-compress-jpeg-or-png-batch-images-linux-commandline/](http://www.tecmint.com/optimize-and-compress-jpeg-or-png-batch-images-linux-commandline/)
