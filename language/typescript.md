# TypeScript

## 基础数据类型

```ts
1. let str: string = "jimmy";
2. let num: number = 24;
3. let bool: boolean = false;
4. let u: undefined = undefined;
5. let n: null = null;
6. let obj: object = {x: 1};
7. let big: bigint = 100n;
8. let sym: symbol = Symbol("me");
```

::: warning

**_null 和 undefined_**

默认情况下 null 和 undefined 是所有类型的子类型。 就是说可以把 null 和 undefined 赋值给其他类型。  
但如果在 tsconfig.json 指定了`"strictNullChecks":true` ，null 和 undefined 只能赋值给 void 和它们各自的类型。

**_number 和 bigint_**

虽然 number 和 bigint 都表示数字，但是这两个类型不兼容。
:::

## 数组 Array

```ts
// 普通数组
let arr:string[] = ["1","2"];
let arr2:Array<string> = ["1","2"]；

// 联合类型数组
let arr:(number | string)[];
// 这个数组中将来既可以存储数值类型的数据, 也可以存储字符串类型的数据
arr3 = [1, 'b', 2, 'c'];

// 指定对象数组
interface Arrobj{
    name:string,
    age:number
}
let arr3:Arrobj[]=[{name:'jimmy',age:22}]
```

## 函数 Function

```ts
// 一般声明
function sum(x: number, y: number): number {
  return x + y;
}

//函数表达式

let sum: (x: number, y: number) => number = function (x, y) {
  return x + y;
};

// interface 定义

interface Sum {
  (x: number, y: number): number;
}
let sun: Sum = (x, y) => {
  return x + y;
};

// 可选参数以及默认值

// 可选参数后不可有必需参数

function sum(x: number, y: number = 2, z?: number) {
  if (z) {
    return x + y + z;
  }
  return x + y;
}

// 剩余参数 arguments

function push(array: number[], ...items: number[]) {
  //items 包括了[1, 2, 3]
  items.forEach(function (item) {
    array.push(item);
  });
}
let a = [];
push(a, 1, 2, 3);

// 函数重载

type AddParams = number | string;
function add(a: AddParams, b: AddParams) {
  if (typeof a === "string" || typeof b === "string") {
    return a.toString() + b.toString();
  }
  return a + b;
}
const result = add("Semlinker", " Kakuqo");
// ts 推断 result 类型为 string|number
result.split(" ");
// 但是会报错`Property 'split' does not exist on type 'number'.`此时就需要用到函数重载

type Types = number | string;
function add(a: number, b: number): number;
function add(a: string, b: string): string;
function add(a: string, b: number): string;
function add(a: number, b: string): string;
function add(a: Types, b: Types) {
  if (typeof a === "string" || typeof b === "string") {
    return a.toString() + b.toString();
  }
  return a + b;
}
const result = add("Semlinker", " Kakuqo");
//通过函数重载，此时 ts 推断 result 类型为 string
result.split(" ");
//不报错
```

### 联合类型数组

```ts
let arr: (number | string)[];
```

### interface

```ts
interface Arrayobj {
  name: string;
  age: number;
}
let arr3: Arrayobj[] = [
  {
    name: "xxx",
    age: 18,
  },
];
```

## 元组 Tuple

TypeScript 中特有的类型，其工作方式类似于数组。元组最重要的特性是可以**限制数组元素的个数和类型**，适合用来实现多值返回。

```ts
let x: [string, number];
// 类型必须匹配且个数必须为2
x = ["hello", 10]; // OK
x = ["hello", 10, 10]; // Error
x = [10, "hello"]; // Error

// 解构赋值
let userInfo:[number,string]=[i,'username']
let [id,username]=userInfo
//以下会报错,长度越界访问。
let [id,username,email]=userInfo

//元组也有可选元素
let userInfo: [string, number，string?];
//以下都不会报错
let userInfo:[number,string]=[i,'username'，'email']
let userInfo:[number,string]=[i,'username']

//元组也有剩余元素
type UserInfo = [number, ...string[]]
let userInfo: UserInfo = [1, 'a', 'b', 'c']
let [id, ...args] = userInfo
// console.log(args) ['a','b','c']

// 只读元组
type UserInfo = readonly [number, ...string[]];
let userInfo: UserInfo = [1, "a", "b", "c"];
// 使用 readonly 关键字修饰元组类型之后，任何企图修改元组中元素的操作都会抛出异常：
userInfo[0] = 2;
userInfo.push("d");
```

## void

void 表示没有任何类型,一般只有在函数没有返回值时去声明。

但是在函数声明中，如果函数没有返回值，那么声明时，需要使用 void，否则会报错：

```ts
function fun(): undefined {
  console.log("this is TypeScript");
}
fun(); // Error
```

## never

1. 如果一个函数执行时抛出了异常，那么这个函数永远不存在返回值（因为抛出异常会直接中断程序运行，这使得程序运行不到返回值那一步，即具有不可达的终点，也就永不存在返回了）；
2. 函数中执行无限循环的代码（死循环），使得程序永远无法运行到函数返回值那一步，永不存在返回。

```ts
// 异常
function err(msg: string): never {
  // OK
  throw new Error(msg);
}

// 死循环
function loopForever(): never {
  // OK
  while (true) {}
}
```

使用 never 可以避免出现新增了联合类型没有对应的实现，目的就是写出类型绝对安全的代码。

```ts
type Foo = string | number | boolean;

function controlFlowAnalysisWithNever(foo: Foo) {
  if (typeof foo === "string") {
    // 这里 foo 被收窄为 string 类型
  } else if (typeof foo === "number") {
    // 这里 foo 被收窄为 number 类型
  } else {
    // foo 在这里是 boolean
    const check: never = foo;
    // 编译错误，因为boolean类型无法赋值给never类型
  }
}
```

## any

任何类型都可以被归为 any 类型。这让 any 类型成为了类型系统的顶级类型.如果我们使用 any 类型，就无法使用 TypeScript 提供的大量的保护机制。尽量不要用 any!

## unknown

unknown 与 any 的最大区别是： 任何类型的值可以赋值给 any，同时 any 类型的值也可以赋值给任何类型。unknown 任何类型的值都可以赋值给它，但它只能赋值给 unknown 和 any，也就意味着如果不缩小类型，就无法对 unknown 类型执行任何操作：

```ts
// 处理动态类型数据 ( api输入 ，用户输入)，使用 unknown 保持类型严格性
function processInput(value: unknown) {
  if (typeof value === "number") {
    console.log(value * 2); // 类型保护后，value 被推断为 number
  } else {
    console.log(value.toUpperCase()); // 类型保护后，value 被推断为 string
  }
}

// 泛型默认类型
function log<T extends unknown>(value: T): void {
  console.log(value);
}

log("TypeScript"); // T 被推断为 string
log(42); // T 被推断为 number

// 避免类型不匹配
interface User {
  name: string;
}

function updateUser(user: unknown) {
  // 错误！不能直接访问 user.name
  // user 可能不是 User 类型
  // 正确写法：
  if (user instanceof User) {
    user.name = "Alice"; // 类型保护后安全访问
  }
}
```

## object、Object 和 {}

小 object 代表的是所有非原始类型，也就是说我们不能把 number、string、boolean、symbol 等 原始类型赋值给 object。  
大 Object 和{} 代表所有拥有 toString、hasOwnProperty 方法的类型，所以所有原始类型、非原始类型都可以赋给 Object。

```ts
// object
let lowerCaseObject: object;
lowerCaseObject = 1; // ts(2322)
lowerCaseObject = "a"; // ts(2322)
lowerCaseObject = true; // ts(2322)
lowerCaseObject = null; // ts(2322)
lowerCaseObject = undefined; // ts(2322)
lowerCaseObject = {}; // ok
// Object
let upperCaseObject: Object;
upperCaseObject = 1; // ok
upperCaseObject = "a"; // ok
upperCaseObject = true; // ok
upperCaseObject = null; // ts(2322)
upperCaseObject = undefined; // ts(2322)
upperCaseObject = {}; // ok
```

::: tip
{}、大 Object 是比小 object 更宽泛的类型（least specific），{} 和大 Object 可以互相代替，用来表示原始类型（null、undefined 除外）和非原始类型；而小 object 则表示非原始类型。
:::

## 类型断言

TypeScript 类型检测无法做到绝对智能,通过类型断言这种方式可以告诉编译器该变量类型

```ts
// 尖括号 语法
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;
// as 语法
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;
```

以上两种方式虽然没有任何区别，但是尖括号格式会与 react 中 JSX 产生语法冲突，更推荐使用 as 语法。

## 非空断言

使用`!`断定操作对象为非 null 或非 undefined

```ts
let mayNullOrUndefinedOrString: null | undefined | string;
mayNullOrUndefinedOrString!.toString(); // ok
mayNullOrUndefinedOrString.toString(); // ts(2531)
```

## 字面量

字符串字面量类型、数字字面量类型、布尔字面量类型

```ts
interface Config {
  // 字符串字面量类型
  size: "small" | "big";
  // 布尔字面量类型
  isEnable: true | false;
  // 数字字面量类型
  margin: 0 | 2 | 4;
}

const config: Config = {
  size: "small",
  isEnable: true,
  margin: 0,
};
```

### let 和 const

let 会把变量推断作为一个基本类型，但 const 会将变量作为一个字面量。
因此也可以用定义一种字面量类型作为枚举

```ts
let str2 = specifiedStr; // 类型是 'string'
const specifiedStr = "this is string"; // 类型是 'this is string',即字面量类型
```

## 联合类型和交叉类型

在 TypeScript 中，联合类型（Union Types）和交叉类型（Intersection Types）是两种重要的类型组合方式，用于描述不同类型之间的关系。以下是对这两种类型的简要说明：

- 联合类型（Union Types）
  联合类型表示一个值可以是多种类型中的一种。使用 | 符号将多个类型连接起来。

  ```ts
  let value: string | number;
  value = "Hello"; // 合法
  value = 42; // 合法
  // value = true;  // 错误，布尔类型不在联合类型内
  function printLength(value: string | number) {
    if (typeof value === "string") {
      console.log(value.length); // 此处 value 被推断为 string
    } else {
      console.log(value.toString().length); // 此处 value 被推断为 number
    }
  }
  ```

  1. 灵活性：允许变量在不同类型之间切换。
  2. 类型保护：需要使用类型保护（如 typeof、instanceof、自定义类型保护函数）来确定具体类型，以便进行相应操作。

- 交叉类型（Intersection Types）
  交叉类型将多个类型合并为一个类型，新类型拥有所有类型的属性和方法。使用 & 符号将多个类型连接起来。

  ```ts
  interface A {
    a: string;
  }

  interface B {
    b: number;
  }

  type AB = A & B;

  let obj: AB = {
    a: "Hello",
    b: 42,
  };

  //举例
  interface Person {
    name: string;
  }

  interface Employee {
    employeeId: number;
  }

  type EmployeePerson = Person & Employee;

  let emp: EmployeePerson = {
    name: "Alice",
    employeeId: 12345,
  };
  ```

  1. 组合性：通过组合多个类型，创建一个包含所有组合类型属性的新类型。
  2. 类型扩展：常用于扩展已有接口或类型，添加更多属性和方法。

::: tip
联合类型适用于描述一个值可能是多种类型中的一种，强调类型的多样性。
交叉类型适用于将多个类型合并为一个新类型，强调类型的组合性。
:::

## interface 和 type

接口的扩展就是继承，通过 extends 来实现。类型别名的扩展就是交叉类型，通过 & 来实现。

```ts
interface PointX {
  x: number;
}
interface Point extends PointX {
  y: number;
}

type Point = PointX & {
  y: number;
};
type PointX = {
  x: number;
};
```

接口可以定义多次,类型别名不可以,定义多次时 interface 会自动合并

```ts
interface Point {
  x: number;
}
interface Point {
  y: number;
}
const point: Point = { x: 1, y: 2 };
```

## 泛型

### typeof

```ts
const message = {
  name: "jimmy",
  age: 18,
  address: {
    province: "四川",
    city: "成都",
  },
};
type Message = typeof message;

type Message = {
  name: string;
  age: number;
  address: {
    province: string;
    city: string;
  };
};
```

### keyof

在编写代码时我们会碰到使用 Object[key]的形式取得对象中的值，但在 ts 中默认会报错没有 string 的索引类型，此时我们需要去定义。

```ts
interface Person {
  name: string;
  age: number;
}

type K1 = keyof Person; // "name" | "age"
type K2 = keyof Person[]; // "length" | "toString" | "pop" | "push" | "concat" | "join"
type K3 = keyof { [x: string]: Person }; // string | number

interface UserInfoMap {
  [key: string]: string | undefined;
}
```

### in

```ts
type Keys = "a" | "b" | "c";

type Obj = {
  [p in Keys]: any;
}; // -> { a: any, b: any, c: any }
```

### infer

```ts
// 取得参数类型
type ParamType<T> = T extends (arg: infer P) => any ? P : T;

//  取到函数返回值的类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

### 映射类型

根据旧的类型创建出新的类型, 我们称之为映射类型

```ts
interface TestInterface {
  name: string;
  age: number;
}
```

```ts
// 我们可以通过+/-来指定添加还是删除

type OptionalTestInterface<T> = {
  [p in keyof T]+?: T[p];
};

type newTestInterface = OptionalTestInterface<TestInterface>;
// type newTestInterface = {
//    name?:string,
//    age?:number
// }
```

### Partial

将类型的属性变成可选

```ts
// 定义
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 使用
type UserInfo = {
    userId: number,
    account: string,
    email: string,
    username: string,
    user_picture:string,
}
const partialUserInfo:Partial<UserInfo>={
  userId:1
  email:'xxxx@foxmail.com'
}
```

:::danger 警告
Partial<`T`> 局限性：只支持处理一层的属性
:::

```ts
// 使用递归实现深克隆
type DeepPartial<T> = {
  // 如果是 object，则递归类型
  [U in keyof T]?: T[U] extends object ? DeepPartial<T[U]> : T[U];
};
```

### Required

**_Required<`T`>将类型的属性变成可选_**

```ts
// 定义
type Required<T> = {
    [P in keyof T]-?: T[P]
};

// 使用
type UserInfo = {
    userId: number,
    account?: string,
    email: string,
    username?: string,
    user_picture?:string,
}
const partialUserInfo:Required<UserInfo>={
  userId:1
  account:'account'
  email:'xxxx@foxmail.com'
  username: 'username'
  user_picture:'base64-String'

}
```

### Readonly

**_`Readonly<T>` 的作用是将某个类型所有属性变为只读属性，也就意味着这些属性不能被重新赋值。_**

```ts
//定义
type Readonly<T> = {
  readonly [p in keyof T]: T[p];
};
```

### Pick

**_`Pick<T,K>`从某个类型中挑出一些属性出来_**

```ts
//定义
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: true,
};
```

### ReturnType

**_`ReturnType<T, U>`用来得到一个函数的返回值类型_**

```ts
//定义
type ReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any;
```

### Exclude

**_`Exclude<T, U>`的作用是将某个类型中属于另一个的类型移除掉。_**

```ts
//定义
type Exclude<T, U> = T extends U ? never : T;
type T = Exclude<"a" | "b" | "c", "a" | "b">; // "c"
```

### Extract

**_`Extract<T, U>`的作用是从 T 中提取出 U。_**

```ts
//定义
type Extract<T, U> = T extends U ? T : never;
type T = Extract<"a" | "b" | "c", "a" | "f">; // "a"
```

### Omit

**_`Omit<T, K extends keyof any>`的作用是使用 T 类型中除了 K 类型的所有属性，来构造一个新的类型。_**

```ts
//定义
type Extract<T, U> = T extends U ? T : never;
type T = Extract<"a" | "b" | "c", "a" | "f">; // "a"
//例子
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Omit<Todo, "description">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};
```

### NonNullable

**_`NonNullable<T>`的作用是用来过滤类型中的 null 及 undefined 类型。_**

```ts
//定义
type NonNullable<T> = T extendsnull | undefined ? never : T;
//例子
type T0 = NonNullable<string | number | undefined>; // string | number
type T1 = NonNullable<string[] | null | undefined>; // string[]
```

### Parameters

**_`Parameters<T>` 的作用是用于获得函数的参数类型组成的元组类型。_**

```ts
//定义
type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;
//例子
type A = Parameters<() => void>; // []
type B = Parameters<typeof Array.isArray>; // [any]
type C = Parameters<typeof parseInt>; // [string, (number | undefined)?]
type D = Parameters<typeof Math.max>; // number[]
```

## tsconfig.json

**_tsconfig.json 是 TypeScript 项目的配置文件。_**

### tsconfig.json 重要字段

- files - 设置要编译的文件的名称；
- include - 设置需要进行编译的文件，支持路径模式匹配；
- exclude - 设置无需进行编译的文件，支持路径模式匹配；
- compilerOptions - 设置与编译流程相关的选项。

### compilerOptions 选项

```json
{
  "compilerOptions": {
    /* 基本选项 */
    "target": "es5", // 指定 ECMAScript 目标版本: 'ES3' (default), 'ES5', 'ES6'/'ES2015', 'ES2016', 'ES2017', or 'ESNEXT'
    "module": "commonjs", // 指定使用模块: 'commonjs', 'amd', 'system', 'umd' or 'es2015'
    "lib": [], // 指定要包含在编译中的库文件
    "allowJs": true, // 允许编译 javascript 文件
    "checkJs": true, // 报告 javascript 文件中的错误
    "jsx": "preserve", // 指定 jsx 代码的生成: 'preserve', 'react-native', or 'react'
    "declaration": true, // 生成相应的 '.d.ts' 文件
    "sourceMap": true, // 生成相应的 '.map' 文件
    "outFile": "./", // 将输出文件合并为一个文件
    "outDir": "./", // 指定输出目录
    "rootDir": "./", // 用来控制输出目录结构 --outDir.
    "removeComments": true, // 删除编译后的所有的注释
    "noEmit": true, // 不生成输出文件
    "importHelpers": true, // 从 tslib 导入辅助工具函数
    "isolatedModules": true, // 将每个文件做为单独的模块 （与 'ts.transpileModule' 类似）.

    /* 严格的类型检查选项 */
    "strict": true, // 启用所有严格类型检查选项
    "noImplicitAny": true, // 在表达式和声明上有隐含的 any类型时报错
    "strictNullChecks": true, // 启用严格的 null 检查
    "noImplicitThis": true, // 当 this 表达式值为 any 类型的时候，生成一个错误
    "alwaysStrict": true, // 以严格模式检查每个模块，并在每个文件里加入 'use strict'

    /* 额外的检查 */
    "noUnusedLocals": true, // 有未使用的变量时，抛出错误
    "noUnusedParameters": true, // 有未使用的参数时，抛出错误
    "noImplicitReturns": true, // 并不是所有函数里的代码都有返回值时，抛出错误
    "noFallthroughCasesInSwitch": true, // 报告 switch 语句的 fallthrough 错误。（即，不允许 switch 的 case 语句贯穿）

    /* 模块解析选项 */
    "moduleResolution": "node", // 选择模块解析策略： 'node' (Node.js) or 'classic' (TypeScript pre-1.6)
    "baseUrl": "./", // 用于解析非相对模块名称的基目录
    "paths": {}, // 模块名到基于 baseUrl 的路径映射的列表
    "rootDirs": [], // 根文件夹列表，其组合内容表示项目运行时的结构内容
    "typeRoots": [], // 包含类型声明的文件列表
    "types": [], // 需要包含的类型声明文件名列表
    "allowSyntheticDefaultImports": true, // 允许从没有设置默认导出的模块中默认导入。

    /* Source Map Options */
    "sourceRoot": "./", // 指定调试器应该找到 TypeScript 文件而不是源文件的位置
    "mapRoot": "./", // 指定调试器应该找到映射文件而不是生成文件的位置
    "inlineSourceMap": true, // 生成单个 soucemaps 文件，而不是将 sourcemaps 生成不同的文件
    "inlineSources": true, // 将代码与 sourcemaps 生成到一个文件中，要求同时设置了 --inlineSourceMap 或 --sourceMap 属性

    /* 其他选项 */
    "experimentalDecorators": true, // 启用装饰器
    "emitDecoratorMetadata": true // 为装饰器提供元数据的支持
  }
}
```
