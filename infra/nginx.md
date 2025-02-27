# Nginx 配置指南

Nginx 的主配置文件是 nginx.conf，这个配置文件一共由三部分组成，分别为全局块、events 块和 http 块。在 http 块中，又包含 http 全局块、多个 server 块。每个 server 块中，可以包含 server 全局块和多个 location 块。在同一配置块中嵌套的配置块，各个之间不存在次序关系。

配置文件支持大量可配置的指令，绝大多数指令不是特定属于某一个块的。

:::tip
同一个指令放在不同层级的块中，其作用域也不同，一般情况下，高一级块中的指令可以作用于自身所在的块和此块包含的所有低层级块。如果某个指令在两个不同层级的块中同时出现，则采用“就近原则”，即以较低层级块中的配置为准。
比如，某指令同时出现在 http 全局块中和 server 块中，并且配置不同，则应该以 server 块中的配置为准。
:::

## 配置文件

```bash
#全局块
#user  nobody;
worker_processes  1;

#event块
events {
    worker_connections  1024;
}

# http块
http {
    # http全局块
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    # server块
    server {

        listen       8000;
        server_name  localhost;
        location / {
            root   html;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
    # 可以多个server块
    # server {}
}
```

## 全局块

全局块是默认配置文件从开始到 events 块之间的一部分内容，主要设置一些影响 Nginx 服务器整体运行的配置指令，因此，这些指令的作用域是 Nginx 服务器全局。

通常包括配置运行 Nginx 服务器的用户（组）、允许生成的 worker process 数、Nginx 进程 PID 存放路径、日志的存放路径和类型以及配置文件引入等。

### user

`user [user] [group]`
指定可以运行 nginx 服务的用户和用户组，只能在全局块配置。

将 user 指令注释掉，或者配置成 `nobody` 的话所有用户都可以运行 `user nobody nobody;`

:::warning
user 指令在 Windows 上不生效，如果你制定具体用户和用户组会报警告

`nginx: [warn] "user" is not supported, ignored in 'xxx'`
:::

### worker_processes

`worker_processes number | auto`  
指定工作线程数，可以制定具体的进程数，也可使用自动模式，这个指令只能在全局块配置

`worker_processes 4;`  
指定 4 个工作线程，这种情况下会生成一个 master 进程和 4 个 worker 进程

### pid && log

`pid logs/nginx.pid`  
指定 pid 文件存放的路径，这个指令只能在全局块配置 ;

指定错误日志的路径和日志级别，此指令可以在全局块、http 块、server 块以及 location 块中配置。
其中 debug 级别的日志需要编译时使用--with-debug 开启 debug 开关

```bash
error_log [path] [debug | info | notice | warn | error | crit | alert | emerg]
error_log logs/error.log notice;
error_log logs/error.log info;
```

## events 块

events 块涉及的指令主要影响 Nginx 服务器与用户的网络连接。这一部分的指令对 Nginx 服务器的性能影响较大，在实际配置中应该根据实际情况灵活调整。

### worker_connections

默认值: 通常为 512 或 1024，具体取决于 Nginx 的版本和编译配置。

作用: 设置每个工作进程（worker process）可以同时打开的最大连接数。当每个工作进程接受的连接数超过这个值时将不再接收连接。  
当所有的工作进程都接收满时，连接进入 logback，logback 满后连接被拒绝。

```bash
# 语法
worker_connections number;

# 示例
events {
    worker_connections 1024;
}
```

::: tip
该值决定了每个工作进程能够处理的最大并发连接数。增加此值可以提高并发处理能力，但需要确保操作系统和硬件资源能够支持。  
这个值不能超过系统支持打开的最大文件数，也不能超过单个进程支持打开的最大文件数,具体可以参考[文章](https://cloud.tencent.com/developer/article/1114773)
:::

### use [method]

作用：指定 Nginx 使用的事件模型（如 epoll、kqueue、rtsig 等）。不同的事件模型在不同的操作系统上性能表现不同。

```bash
# 语法
use event_model;

# 示例
events {
    use epoll;
}
```

- epoll：适用于 Linux 系统，性能优异，适合高并发场景。
- kqueue：适用于 FreeBSD、macOS 等系统，性能同样优秀。
- rtsig：实时信号模型，适用于某些特定场景

:::tip
通常不需要手动指定 use，Nginx 会自动选择最优的事件模型
:::

### multi_accept

默认值： `off`

作用：设置每个工作进程在单个事件循环中是否接受所有可用的新连接。

如果 nginx 使用 kqueue 连接方法，那么这条指令会被忽略，因为这个方法会报告在等待被接受的新连接的数量。

```bash
# 语法
multi_accept on | off;

# 示例
events {
    multi_accept on;
}
```

:::tip
建议：在高并发环境下，通常建议启用 multi_accept 以提高连接处理效率。
:::

### accept_mutex

默认值：

- on（自 Nginx 1.11.3 版本起，默认值为 on）
- off（在 Nginx 1.11.3 之前的版本，默认值为 off）

作用：设置是否启用接受互斥锁（accept mutex），用于协调多个工作进程之间的连接接受。

```bash
# 语法
accept_mutex on | off;

# 示例
events {
    accept_mutex on;
}
```

当某一时刻只有一个网络连接到来时，多个睡眠进程会被同时叫醒，但只有一个进程可获得连接。  
如果每次唤醒的进程数目太多，会影响一部分系统性能。  
在 Nginx 服务器的多进程下，就有可能出现这样的问题。  
开启的时候，将会对多个 Nginx 进程接收连接进行序列化，防止多个进程对连接的争抢。

:::tip
在多核系统上，通常建议启用 accept_mutex 以提高稳定性和性能。
:::

### accept_mutex_delay

作用：设置当一个工作进程无法立即获得接受互斥锁时，等待多长时间后再次尝试。

```bash
# 语法
accept_mutex_delay milliseconds (默认值通常为 500ms，可以根据实际需求调整);

# 示例
events {
    accept_mutex_delay 500;
}
```

### worker_connections 与 worker_processes 的关系

- 总的最大并发连接数由 worker_connections 和 worker_processes 决定。计算公式为：

  ```bash
  总最大连接数 = worker_processes × worker_connections
  ```

- 例如，如果有 4 个工作进程，每个工作进程可以处理 1024 个连接，那么总的最大并发连接数为 4096。

### 综合示例

```bash
events {
    worker_connections 1024;
    use epoll;               # 在 Linux 上使用 epoll
    multi_accept on;         # 启用多接受模式
    accept_mutex on;         # 启用接受互斥锁
    accept_mutex_delay 500;  # 等待 500ms 后重试
}
```

## http 块

http 块是 Nginx 服务器配置中的重要部分，代理、缓存和日志定义等绝大多数的功能和第三方模块的配置都可以放在这个模块中。

前面已经提到，http 块中可以包含自己的全局块，也可以包含 server 块，server 块中又可以进一步包含 location 块。

http 全局块中配置的指令包括文件引入、MIME-Type 定义、日志自定义、是否使用 sendfile 传输文件、连接超时时间、单连接请求数上限等。

### MIME-Type 定义

常用的浏览器中，可以显示的内容有 HTML、XML、GIF 及 Flash 等种类繁多的文本、媒体等资源，浏览器为区分这些资源，需要使用 MIME Type。换言之，MIME Type 是网络资源的媒体类型。Nginx 服务器作为 Web 服务器，必须能够识别前端请求的资源类型。

### include

作用：包含其他配置文件，便于组织和管理配置。

```bash
# 语法：
include file | mask;

# 示例：
include /etc/nginx/conf.d/\*.conf;
```

include 指令，用于包含其他的配置文件，可以放在配置文件的任何地方，但是要注意你包含进来的配置文件一定符合配置规范，即必须是 server 块内容的形式。
mime.types 文件是 Nginx 服务器默认的 MIME-Type 定义文件，默认位置在 nginx 安装目录的 conf 目录下，也可以自定义。

### default_type

默认值： text/plain

作用: 设置默认的 MIME 类型，当 Nginx 无法确定文件类型时使用。

`default_type application/octet-stream;`

### access_log && error_log

分别用于配置访问日志和错误日志的路径和格式。

```bash
# 语法
access_log path [format [buffer=size]]
# 示例:
http {
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
}
```

### log_format

用于定义日志格式，此指令只能在 http 块中进行配置

```bash
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" uht="$upstream_header_time" urt="$upstream_response_time"';

# 使用
access_log logs/access.log main;
```

### sendfile

`sendfile on | off; default off`

sendfile 指令在 Nginx 配置中用于优化静态文件的传输性能。它允许 Nginx 直接在内核空间中将文件从磁盘传输到网络套接字，而无需将数据拷贝到用户空间。这种零拷贝（zero-copy）机制显著提高了文件传输的效率，减少了 CPU 和内存的开销。

sendfile 主要适用于以下场景：

- 静态文件服务：如网站静态资源（CSS、JavaScript、图片等）的传输。
- 高并发环境：在高并发请求下，sendfile 可以显著提升文件传输效率。
- 大文件传输：对于较大的文件，sendfile 的性能优势更加明显。

设置 sendfile 最大数据量,此指令可以在 http 块、server 块或 location 块中配置
sendfile_max_chunk size;
其中，size 值如果大于 0，Nginx 进程的每个 worker process 每次调用 sendfile()传输的数据量最大不能超过这个值(这里是 128k，所以每次不能超过 128k)；如果设置为 0，则无限制。默认值为 0。
sendfile_max_chunk 128k;

### tcp_nopush

`tcp_nopush on | off; default off`

tcp_nopush 是 Nginx 配置中的一个指令，用于优化 TCP 数据包的发送方式，特别是在启用 sendfile 指令时。它通过确保在发送多个小文件时，Nginx 能够将它们合并成一个 TCP 包发送，从而减少网络开销，提高传输效率。

#### 工作原理

当 `sendfile` 指令启用时，Nginx 可以直接在内核空间中将文件从磁盘传输到网络套接字，而无需将数据拷贝到用户空间。然而，在某些情况下，这可能会导致发送大量的小 TCP 包，增加网络开销。

`tcp_nopush` 的作用是在启用 `sendfile` 的基础上，确保在发送多个小文件时，Nginx 能够将它们合并成一个 TCP 包发送。这样可以减少 TCP 包的数量，降低网络拥塞的可能性，并提高传输效率。

#### 总结

tcp_nopush 指令通过优化 TCP 数据包的发送方式，显著提高了 Nginx 在传输静态文件时的性能。合理配置 tcp_nopush 及相关指令（如 sendfile），可以在高并发和大文件传输场景下，提升服务器的整体性能和响应速度。

### tcp_nodelay

默认值: on

作用: tcp_nodelay 是一个与 TCP 协议相关的配置选项，用于控制是否启用 Nagle 算法。它的作用与通用的 TCP_NODELAY 选项一致，但在 Nginx 的上下文中，它的行为和应用场景有一些特定的细节。

#### 适用场景

1. HTTP/1.1 长连接：
   在 HTTP/1.1 中，默认使用持久连接（keepalive），客户端和服务器之间会复用同一个 TCP 连接发送多个请求和响应。
   禁用 Nagle 算法可以确保每个响应数据包能够立即发送，减少延迟。

2. WebSocket：
   WebSocket 是一种实时通信协议，需要低延迟。禁用 Nagle 算法可以确保 WebSocket 消息能够及时发送。

3. 小文件传输：
   对于小文件（如 CSS、JavaScript、图片等），禁用 Nagle 算法可以避免数据包被延迟发送，提升加载速度。

#### 不适用场景

1. 大文件传输：
   对于大文件传输，启用 Nagle 算法可以减少小数据包的数量，提高网络效率。因此，在这种情况下，可以将 tcp_nodelay 设置为 off。

2. 高带宽、低延迟网络：
   在某些高带宽、低延迟的网络环境中，Nagle 算法的影响可能较小，禁用 tcp_nodelay 的效果可能不明显。

### keepalive_timeout

默认值: 75s

作用：设置客户端与服务器之间的 keep-alive 连接超时时间。

### upstram

作用：定义上游服务器组，通常用于负载均衡或反向代理。

```bash
http {
    upstream backend {
        server 192.168.1.1;
        server 192.168.1.2;
    }
}
```

### add_header

作用： 添加自定义的 HTTP 响应头

```bash
http {
    add_header X-Frame-Options "SAMEORIGIN";
}
```

### error_page

作用： 自定义错误页面，指定在发生特定 HTTP 错误时返回的页面。

```bash
http {
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

## server 块

### 概览

server 块用于定义虚拟主机（Virtual Host），每个 server 块通常对应一个域名或 IP 地址。server 块中可以配置监听端口、域名、根目录、访问控制等。以下是一些在 server 块中常见的配置项：

虚拟主机，又称虚拟服务器、主机空间或是网页空间，它是一种技术。该技术是为了节省互联网服务器硬件成本而出现的。这里的“主机”或“空间”是由实体的服务器延伸而来，硬件系统可以基于服务器群，或者单个服务器等。虚拟主机技术主要应用于 HTTP、FTP 及 EMAIL 等多项服务，将一台服务器的某项或者全部服务内容逻辑划分为多个服务单位，对外表现为多个服务器，从而充分利用服务器硬件资源。从用户角度来看，一台虚拟主机和一台独立的硬件主机是完全一样的。

在使用 Nginx 服务器提供 Web 服务时，利用虚拟主机的技术就可以避免为每一个要运行的网站提供单独的 Nginx 服务器，也无需为每个网站对应运行一组 Nginx 进程。虚拟主机技术使得 Nginx 服务器可以在同一台服务器上只运行一组 Nginx 进程，就可以运行多个网站。

在前面提到过，每一个 http 块都可以包含多个 server 块，而每个 server 块就相当于一台虚拟主机，它内部可有多台主机联合提供服务，一起对外提供在逻辑上关系密切的一组服务（或网站）。

和 http 块相同，server 块也可以包含自己的全局块，同时可以包含多个 location 块。在 server 全局块中，最常见的两个配置项是本虚拟主机的监听配置和本虚拟主机的名称或 IP 配置。

### root && index

作用：root - 设置网站文件的根目录。 index - 指定默认的索引文件。

### listen 指令

server 块中最重要的指令就是 listen 指令，这个指令有三种配置语法。这个指令默认的配置值是：`listen _:80 | _:8000`；只能在 server 块种配置这个指令。

```bash
# 第一种
listen address[:port] [default_server] [ssl] [http2 | spdy] [proxy_protocol]
[setfib=number] [fastopen=number] [backlog=number] [rcvbuf=size] [sndbuf=size]
[accept_filter=filter] [deferred] [bind] [ipv6only=on|off] [reuseport]
[so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];

# 第二种
listen port [default_server] [ssl] [http2 | spdy] [proxy_protocol] [setfib=number]
[fastopen=number] [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter]
[deferred] [bind] [ipv6only=on|off] [reuseport] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];

```

listen 指令的配置非常灵活，可以单独制定 ip，单独指定端口或者同时指定 ip 和端口。

```makefile
listen 127.0.0.1:8000; #只监听来自 127.0.0.1 这个 IP，请求 8000 端口的请求
listen 127.0.0.1; #只监听来自 127.0.0.1 这个 IP，请求 80 端口的请求（不指定端口，默认 80）
listen 8000; #监听来自所有 IP，请求 8000 端口的请求
listen \*:8000; #和上面效果一样
listen localhost:8000; #和第一种效果一致
```

关于上面的一些重要参数做如下说明：

- address：监听的 IP 地址（请求来源的 IP 地址），如果是 IPv6 的地址，需要使用中括号“[]”括起来，比如[fe80::1]等。
- port：端口号，如果只定义了 IP 地址没有定义端口号，就使用 80 端口。这边需要做个说明：要是你压根没配置 listen 指令，那么那么如果 nginx 以超级用户权限运行，则使用*:80，否则使用*:8000。多个虚拟主机可以同时监听同一个端口,但是 server_name 需要设置成不一样；
- default_server：假如通过 Host 没匹配到对应的虚拟主机，则通过这台虚拟主机处理。具体的可以参考这篇文章，写的不错。
- backlog=number：设置监听函数 listen()最多允许多少网络连接同时处于挂起状态，在 FreeBSD 中默认为-1，其他平台默认为 511。
- accept_filter=filter，设置监听端口对请求的过滤，被过滤的内容不能被接收和处理。本指令只在 FreeBSD 和 NetBSD 5.0+平台下有效。filter 可以设置为 dataready 或 httpready，感兴趣的读者可以参阅 Nginx 的官方文档。
- bind：标识符，使用独立的 bind()处理此 address:port；一般情况下，对于端口相同而 IP 地址不同的多个连接，Nginx 服务器将只使用一个监听命令，并使用 bind()处理端口相同的所有连接。
- ssl：标识符，设置会话连接使用 SSL 模式进行，此标识符和 Nginx 服务器提供的 HTTPS 服务有关。
  listen 指令的使用看起来比较复杂，但其实在一般的使用过程中，相对来说比较简单，并不会进行太复杂的配置。

### server_name

指定虚拟主机的域名，支持通配符和正则表达式。

```bash
server {
    server_name example.com www.example.com;  # 多个域名
    server_name *.example.com;               # 通配符
    server_name ~^(www\.)?example\.com$;     # 正则表达式
}
```

由于 server_name 指令支持使用通配符和正则表达式两种配置名称的方式，因此在包含有多个虚拟主机的配置文件中，可能会出现一个名称被多个虚拟主机的 server_name 匹配成功。那么，来自这个名称的请求到底要交给哪个虚拟主机处理呢？Nginx 服务器做出如下规定：

1. 对于匹配方式不同的，按照以下的优先级选择虚拟主机，排在前面的优先处理请求。
   - 准确匹配 server_name
   - 通配符在开始时匹配 server_name 成功
   - 通配符在结尾时匹配 server_name 成功
   - 正则表达式匹配 server_name 成功
2. 在以上四种匹配方式中，如果 server_name 被处于同一优先级的匹配方式多次匹配成功，则首次匹配成功的虚拟主机处理请求。

### rewrite && return

(rewrite)作用： 重写 URL，支持正则表达式。

```bash
server {
    rewrite ^/old-url$ /new-url permanent;  # 永久重定向
    rewrite ^/old-path/(.*)$ /new-path/$1;  # 重写路径
}
```

(return)作用：直接返回指定的状态码或重定向。

```bash
server {
    return 301 https://example.com$request_uri;  # 永久重定向到 HTTPS
    return 404 "Not Found";                       # 返回 404 状态码
}
```

---

rewrite 和 return 都可以用于实现 HTTP 到 HTTPS 的重定向，但它们的实现方式、性能和使用场景有所不同。
`rewrite ^(.*)$ https://$host$1 permanent;` & `return 301 https://$host$request_uri;`  
在大多数情况下，return 是实现 HTTP 到 HTTPS 重定向的首选方式。

HTTP 到 HTTPS 重定向：这是最常见的场景，`return`性能更高，代码更简洁。
简单路径重定向：如果只需要简单的路径重定向，`return` 是更好的选择。

```bash
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

复杂路径重定向：如果需要根据路径或条件进行复杂的重定向，`rewrite` 更灵活。
正则匹配需求：如果需要使用正则表达式匹配特定的路径或参数，`rewrite` 是必要的。

```bash
server {
    listen 80;
    server_name example.com;
    # 将所有 /old-path/ 开头的请求重定向到 HTTPS
    rewrite ^/old-path/(.*)$ https://$host/new-path/$1 permanent;
}
```

## location 块

每个 server 块中可以包含多个 location 块。在整个 Nginx 配置文档中起着重要的作用，而且 Nginx 服务器在许多功能上的灵活性往往在 location 指令的配置中体现出来。

location 块的主要作用是，基于 Nginx 服务器接收到的请求字符串（例如 server_name/uri-string），对除虚拟主机名称（也可以是 IP 别名，后文有详细阐述）之外的字符串（前例中“/uri-string”部分）进行匹配，对特定的请求进行处理。地址定向、数据缓存和应答控制等功能都是在这部分实现。许多第三方模块的配置也是在 location 块中提供功能。

### 语法及匹配原理

#### 语法

`location [ = | ~ | ~* | ^~ ] uri { ... }`

#### 匹配模式

- “=”，用于标准 uri 前，要求请求字符串与 uri 严格匹配。如果已经匹配成功，就停止继续向下搜索并立即处理此请求。
- “^～”，用于标准 uri 前，要求 Nginx 服务器找到标识 uri 和请求字符串匹配度最高的 location 后，立即使用此 location 处理请求，而不再使用 location 块中的正则 uri 和请求字符串做匹配。
- “～”，用于表示 uri 包含正则表达式，并且区分大小写。
- “～*”，用于表示 uri 包含正则表达式，并且不区分大小写。注意如果 uri 包含正则表达式，就必须要使用“～”或者“～*”标识。

#### 匹配规则

1. 默认匹配流程：

   - 首先，Nginx 在所有 location 块中查找标准 URI 的匹配。
   - 如果有多个匹配，记录匹配度最高的一个。
   - 然后，依次检查正则 URI 的匹配，第一个匹配成功的 location 块将处理请求。
   - 如果正则匹配全部失败，则使用之前记录的标准 URI 匹配度最高的 location 块。

2. 匹配模式影响
   - =：精确匹配优先级最高，匹配成功后立即停止搜索。
   - ^~：前缀匹配优先级高于正则匹配，匹配成功后不再检查正则 URI。
   - ~ 和 ~\*：正则匹配优先级低于前缀匹配，但高于默认标准 URI 匹配。

::: tip
我们知道，在浏览器传送 URI 时对一部分字符进行 URL 编码，比如空格被编码为“%20”，问号被编码为“%3f”等。“～”有一个特点是，它对 uri 中的这些符号将会进行编码处理。比如，如果 location 块收到的 URI 为“/html/%20/data”，则当 Nginx 服务器搜索到配置为“～ /html/ /data”的 location 时，可以匹配成功。
:::

## 现代 web 配置

```bash
# 核心配置
user www-data;                        # 使用专用低权限用户（推荐 www-data）
worker_processes auto;                # 自动匹配 CPU 核心数
worker_rlimit_nofile 65535;           # 文件描述符限制（需同步调整系统 ulimit）

error_log /var/log/nginx/error.log warn;  # 错误日志级别调整为 warning
pid /run/nginx.pid;

events {
    worker_connections 10240;         # 现代硬件建议值
    multi_accept on;                  # 高效接收新连接
    use epoll;                        # Linux 高性能事件模型
}

http {
    # 基础模块
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 现代协议优化
    sendfile on;                      # 零拷贝传输
    sendfile_max_chunk 512k;          # 防止 worker 进程阻塞
    tcp_nopush on;                    # 优化数据包发送
    tcp_nodelay on;                   # 禁用 Nagle 算法
    keepalive_timeout 75s;            # 长连接超时
    keepalive_requests 1000;          # 单个连接最大请求数

    # 安全响应头（推荐配置）
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # TLS 配置（建议单独配置到 ssl.conf）
    ssl_protocols TLSv1.2 TLSv1.3;    # 仅启用现代协议
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # 现代压缩配置
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        application/xml+rss
        font/woff
        font/woff2
        image/svg+xml;

    # Brotli 压缩（需要模块支持）
    # brotli on;
    # brotli_comp_level 6;
    # brotli_types *;

    # 日志优化
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time '
                    '$ssl_protocol/$ssl_cipher';

    access_log /var/log/nginx/access.log main buffer=32k flush=5s;

    # 静态资源缓存策略
    map $sent_http_content_type $cache_control {
        default         "no-store";
        "text/html"     "no-cache";
        ~image/         "public, max-age=31536000, immutable";
        ~font/          "public, max-age=31536000, immutable";
        ~text/css       "public, max-age=31536000";
        ~application/javascript "public, max-age=31536000";
    }

    # 负载均衡（示例）
    upstream backend {
        least_conn;                   # 使用最少连接算法
        server 192.168.80.121:80 weight=3 max_fails=2 fail_timeout=30s;
        server 192.168.80.122:80 weight=2 max_fails=2 fail_timeout=30s;
        server 192.168.80.123:80 backup;  # 备用服务器

        keepalive 32;                 # 保持长连接
    }

    # 虚拟主机模板（建议拆分为独立文件）
    server {
        listen 80 reuseport;
        listen [::]:80 reuseport;
        server_name example.com www.example.com;

        # 强制 HTTPS（现代 Web 标准）
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2 reuseport;
        listen [::]:443 ssl http2 reuseport;
        server_name example.com www.example.com;

        # SSL 证书路径
        ssl_certificate /etc/ssl/certs/example.com.crt;
        ssl_certificate_key /etc/ssl/private/example.com.key;

        # HSTS 安全头（谨慎启用）
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

        root /var/www/example.com;
        index index.html;

        # 安全限制
        client_max_body_size 100M;    # 文件上传限制
        client_body_buffer_size 1M;

        # 动态请求处理
        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # 超时控制
            proxy_connect_timeout 5s;
            proxy_send_timeout 10s;
            proxy_read_timeout 30s;
        }

        # 静态资源处理
        location /static/ {
            expires max;
            add_header Cache-Control $cache_control;
            access_log off;
            open_file_cache max=1000 inactive=30s;
            open_file_cache_valid 60s;
            open_file_cache_min_uses 2;
            open_file_cache_errors on;
        }

        # 前端路由（SPA 支持）
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 安全防护
        location ~* \.(php|asp|aspx|jsp)$ {
            deny all;
            return 403;
        }
    }

    # 包含其他配置
    include /etc/nginx/conf.d/*.conf;
}
```
