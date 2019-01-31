# wwmp-quickstart

wwmp-quickstart


# 安装

```
npm install wwmp-cli -g
```

# 使用

示例：

```
wwmp create pageek/wwmp-quickstart my-project
```

为方便后续管理模板，可先通过wwmp add 把项目pageek/wwmp-quickstart另起一个别名（例：wwmp）存储在模板列表，添加时直接使用别名即可；

```
wwmp create wwmp my-project

或：

wwmp init 进入交互式界面，按提示输入信息创建；

```


```
  Usage: wwmp <command>

  Commands:

    add     | a     添加模板
    list    | l     显示所有模板列表
    init    | i     通过wwmp init选择模板并创建一个新项目
    create  | c     通过wwmp create <模板名> <项目名> 直接创建新项目
    delete  | d     删除预置模板

  Options:

    -h, --help     输出帮助信息
    -V, --version  输出版本号信息
```
