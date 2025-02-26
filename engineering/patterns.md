# 代码设计模式

## 原则

设计模式原则

- **S – Single Responsibility Principle 单一职责原则**

  - 一个程序只做好一件事
  - 如果功能过于复杂就拆分开，每个部分保持独立

- **O – OpenClosed Principle 开放/封闭原则**

  - 对扩展开放，对修改封闭
  - 增加需求时，扩展新代码，而非修改已有代码

- L – Liskov Substitution Principle 里氏替换原则

  - 子类能覆盖父类
  - 父类能出现的地方子类就能出现

- I – Interface Segregation Principle 接口隔离原则

  - 保持接口的单一独立
  - 类似单一职责原则，这里更关注接口

- D – Dependency Inversion Principle 依赖倒转原则
  - 面向接口编程，依赖于抽象而不依赖于具体
  - 使用方只关注接口而不关注具体类的实现

## 例子

### Promise

- 单一职责原则：每个 then 中的逻辑只做好一件事
- 开放封闭原则（对扩展开放，对修改封闭）：如果新增需求，扩展 then

### 校验

```js
let checkType = function (str, type) {
  switch (type) {
    case "email":
      return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(str);
    case "mobile":
      return /^1[3|4|5|7|8][0-9]{9}$/.test(str);
    case "tel":
      return /^(0\d{2,3}-\d{7,8})(-\d{1,4})?$/.test(str);
    default:
      return true;
  }
};
```

每次添加其他规则都需要增加 case 修改！这样违反了开放-封闭原则（对扩展开放，对修改关闭），导致整个 API 变得臃肿，难维护。
比如 A 页面需要添加一个金额的校验，B 页面需要一个日期的校验，但是金额的校验只在 A 页面需要，日期的校验只在 B 页面需要。如果一直添加 case 。就是导致 A 页面把只在 B 页面需要的校验规则也添加进去，造成不必要的开销。B 页面也同理。

```js
class Check {
  constructor() {
    this.rules = {
      email(str) {
        return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(str);
      },
      mobile(str) {
        return /^1[3|4|5|7|8][0-9]{9}$/.test(str);
      },
    };
  }
  check(str, type) {
    return this.rules[type] ? this.rules[type](str) : false;
  }
  //添加规则
  addRule(type, fn) {
    this.rules[type] = fn;
  }
}

CheckInstance = new Check();
console.log(CheckInstance.check("188170239", "mobile"));
//添加金额校验规则
CheckInstance.addRule("money", function (str) {
  return /^[0-9]+(.[0-9]{2})?$/.test(str);
});
//使用金额校验规则
console.log(CheckInstance.check("18.36", "money"));
```

## 工厂模式

目的：定义一个创建对象的接口，让其子类自己决定实例化哪一个工厂类，运行时从许多子系统中进行挑选。  
优点：只需要关心创建结果；想创建一个对象，只要知道其名称；扩展性高  
缺点：每次增加一个产品时，都需要增加一个具体类和对象实现工厂，使得系统中类的个数成倍增加，在一定程度上增加了系统的复杂度，同时也增加了系统具体类的依赖。

```js
    class ShapeFactory {
    //使用 getShape 方法获取形状类型的对象
        getShape(String shapeType){
            if(shapeType == null){
                return null;
            }
            if(shapeType==="CIRCLE"){
                return new Circle();
            } else if(shapeType==="RECTANGLE"){
                return new Rectangle();
            } else if(shapeType==="SQUARE"){
                return new Square();
            }
            return null;
        }
    }
```

## 单例模式

目的：通过提供全局访问点实现一个类只有一个实例  
优点：划分命名空间，减少全局变量；便于调试维护；

```js
 class LoginForm {
    constructor() {
        this.state = 'hide'
    }
    show() {
        if (this.state === 'show') {
            return
        }
        this.state = 'show'
        console.log('登录框显示成功')
    }
    hide() {
        if (this.state === 'hide') {
            return
        }
        this.state = 'hide'
        console.log('登录框隐藏成功')
    }
 }
 LoginForm.getInstance = (function () {
     let instance
     return function () {
        if (!instance) {
            instance = new LoginForm()
        }
        return instance
     }
 })()

 //相比较于以下提供全局访问点的好处是需要的时候才实例化
 LoginFormInstance=New LoginForm()
 export LoginFormInstance
```

## 适配器模式

目的：将一个类的接口转化为另外一个接口，以满足用户需求，使类之间接口不兼容问题通过适配器得以解决。  
优点：可以让任何两个没有关联的类一起运行。提高类复用  
缺点：存在额外对象的创建开销

```js
class Plug {
  getName() {
    return "iphone充电头";
  }
}

class Target {
  constructor() {
    this.plug = new Plug();
  }
  getName() {
    return this.plug.getName() + " 适配Type-c充电头";
  }
}

let target = new Target();
target.getName(); // iphone充电头 适配Type-c充电头
```

如 Vue 中使用的计算属性，原有的 data 中的数据不满足要求，通过计算属性来适配改变表现形式。或者适配老旧代码。

```js
// 封装的ajax， 使用方式如下
ajax({
  url: "/getData",
  type: "Post",
  dataType: "json",
  data: {
    test: 111,
  },
}).done(function () {});
// 因为历史原因，代码中全都是：
// $.ajax({....})

// 做一层适配器
var $ = {
  ajax: function (options) {
    return ajax(options);
  },
};
```

## 装饰器模式

装饰者模式在不改变原始类接口的情况下，对原始类功能进行增强，并且支持多个装饰器的嵌套使用。

```js
class Cellphone {
  create() {
    console.log("生成一个手机");
  }
}
class Decorator {
  constructor(cellphone) {
    this.cellphone = cellphone;
  }
  create() {
    this.cellphone.create();
    this.createShell(cellphone);
  }
  createShell() {
    console.log("生成手机壳");
  }
}
// 测试代码
let cellphone = new Cellphone();
cellphone.create();
let dec = new Decorator(cellphone);
dec.create();
```

## 代理模式

dom 元素事件代理

```html
<ul id="ul">
  <li>1</li>
  <li>2</li>
  <li>3</li>
</ul>
<script>
  let ul = document.querySelector("#ul");
  ul.addEventListener("click", (event) => {
    console.log(event.target);
  });
</script>
```

**适配器、装饰器、代理三种设计模式的区别**  
代理模式：代理模式在不改变原始类接口的条件下，为原始类定义一个代理类，主要目的是控制访问，而非加强功能，这是它跟装饰器模式最大的不同。  
装饰器模式：装饰者模式在不改变原始类接口的情况下，对原始类功能进行增强，并且支持多个装饰器的嵌套使用。  
适配器模式：适配器模式是一种事后的补救策略。适配器提供跟原始类不同的接口，而代理模式、装饰器模式提供的都是跟原始类相同的接口。

## 外观模式

目的：为子系统中的一组接口提供一个一致的界面，外观模式定义了一个高层接口，这个接口使得这一子系统更加容易使用。

```ts
interface Shape {
  draw(): void;
}
class Circle implements Shape {
  draw(): void {
    console.log("Circle::draw()");
  }
}
class Rectangle implements Shape {
  draw(): void {
    console.log("Rectangle::draw()");
  }
}
class Square implements Shape {
  draw(): void {
    console.log("Square::draw()");
  }
}
class ShapeMaker {
  circle: Shape;
  rectangle: Shape;
  square: Shape;

  constructor() {
    this.circle = new Circle();
    this.rectangle = new Rectangle();
    this.square = new Square();
  }

  drawCircle() {
    this.circle.draw();
  }
  drawRectangle() {
    this.rectangle.draw();
  }
  drawSquare() {
    this.square.draw();
  }
}

export default ShapeMaker;
```

## 观察者模式

对象的状态发生变化时就会通知所有的观察者对象，使它们能够自动更新自己，当一个对象的改变需要同时改变其它对象。

```js
// 主题 保存状态，状态变化之后触发所有观察者对象
class Subject {
  private state: number
  private observers: Observer[]
  constructor() {
    this.state = 0
    this.observers = []
  }
  getState() {
    return this.state
  }
  setState(state: number) {
    this.state = state
    this.notifyAllObservers()
  }
  notifyAllObservers() {
    this.observers.forEach((observer) => {
      observer.update()
    })
  }
  attach(observer: Observer) {
    this.observers.push(observer)
  }
}

// 观察者
class Observer {
  name: string
  subject: Subject
  constructor(name: string, subject: Subject) {
    this.name = name
    this.subject = subject
    this.subject.attach(this)
  }
  update() {
    console.log(`${this.name} update, state: ${this.subject.getState()}`)
  }
}

// 测试
let sub = new Subject()
let ob1 = new Observer('ob1', sub)
let ob2 = new Observer('0b2', sub)

sub.setState(12)
```

## 状态模式

允许一个对象在其内部状态改变的时候改变它的行为，对象看起来似乎修改了它的类
每种状态中有对应的方法，根据此刻不同的状态，而使对应的动作呈现不同的结果。

```ts
// 状态 （弱光、强光、关灯）
class State {
  constructor(state) {
    this.state = state;
  }
  handle(context) {
    console.log(`this is ${this.state} light`);
    context.setState(this);
  }
}
class Context {
  constructor() {
    this.state = null;
  }
  getState() {
    return this.state;
  }
  setState(state) {
    this.state = state;
  }
}
// test
let context = new Context();
let weak = new State("weak");
let strong = new State("strong");
let off = new State("off");

// 弱光
weak.handle(context);
console.log(context.getState());

// 强光
strong.handle(context);
console.log(context.getState());

// 关闭
off.handle(context);
console.log(context.getState());
```

策略模式 vs 状态模式<https://www.runoob.com/w3cnote/state-vs-strategy.html>

## 迭代器模式

```javascript
class Iterator {
  constructor(list) {
    this.list = list;
    this.index = 0;
  }
  next() {
    if (this.hasNext()) {
      return this.list[this.index++];
    }
    return null;
  }
  hasNext() {
    if (this.index >= this.list.length) {
      return false;
    }
    return true;
  }
}

// 测试代码
let iterator = new Iterator([1, 2, 3, 4, 5]);
while (iterator.hasNext()) {
  console.log(iterator.next());
}
```

## 组合模式

```javascript
class TrainOrder {
  create() {
    console.log("创建火车票订单");
  }
}
class HotelOrder {
  create() {
    console.log("创建酒店订单");
  }
}

class TotalOrder {
  constructor() {
    this.orderList = [];
  }
  addOrder(order) {
    this.orderList.push(order);
    return this;
  }
  create() {
    this.orderList.forEach((item) => {
      item.create();
    });
    return this;
  }
}
// 可以在购票网站买车票同时也订房间
let train = new TrainOrder();
let hotel = new HotelOrder();
let total = new TotalOrder();
total.addOrder(train).addOrder(hotel).create();
```
