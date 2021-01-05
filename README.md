# Next js & TypeORM

> 기억해야 할 것들을 기록

## 1일차

---

### 1. postgres 설치하기

```
$ brew install postgresql
$ pg_ctl -D /usr/local/var/postgres start && brew services start postgresql // postgres start every time your computer starts up.
```

추가로, 사용자 및 데이터베이스 생성은 [블로그](https://www.codementor.io/@engineerapart/getting-started-with-postgresql-on-mac-osx-are8jcopb) 참고

### 2. postgres 명령어

`psql postgres -U parkoon` - Connect postgres user **parkoon**

`\c koondit` - Connect Database **koondit**

`\list` - List of Database

`\dt` - Connected Database Table list

`\du` - User List

`\d users` - Detail Info of User table

### 3. TypeORM 세팅하기

```
$ npm i -g typeorm
$ typeorm init --database postgres

$ npm i ts-node@latest @types/node@latest typescript@latest
```

### 4. 유용한 VSCODE 명령어

> https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets 설치

```javascript
imp > import moduleName from 'module'
imd > import { destructuredModule } from 'module'
dob > const  { propName }  = objectToDestruct
trycatch > try {} catch(err) {}
nfn > const name = (params) => { }
```

### 5. 객체에 있는 toJSON 의 정체

네트워크 통신 할 때 객체를 JSON 형대로 보내게 된다. 객체를 JSON 형태로 변환할 수 있는 메소드로 `JSON.stringify` 가 있다. `JSON.stringify`가 호출되면 class는 내장되어 있는 `toJSON` 를 호출한다.

```javascript
let room = {
    number: 23,
    toJSON() {
        return this.number + 1
    },
}

JSON.stringify(room) // "{"number":23}" (X) "24" (O)
```

### 6. typeorm class-validator class-transformer 조합

위 조합으로 유효성 검증, 필요한 데이터만 추출 등 많은 기능들을 편하게 사용 할 수 있다.

`class-transformer 의 classToPlain`

```
In JavaScript there are two types of objects:

 - plain (literal) objects
 - class (constructor) objects

Plain objects are objects that are instances of Object class.
Sometimes they are called literal objects, when created via {} notation.
Class objects are instances of classes with own defined constructor, properties and methods.
Usually you define them via class notation.
```

ref. https://github.com/typestack/class-transformer

## 2일차

---

### res.locals

### No user variable (like req) to \_

### Why we have to use slug in posts

-   SEO
-   URL만 보고 포스트의 내용을 짐작 할 수 있다.

### Migration

마이그레이션이란, 한 운영 환경으로부터 다른 운영환경으로 옮기는 작업을 의미한다. (ex, Window --> Linux)
데이터베이스에서, **데이터 마이그레이션**은 조금 다른 의미로 사용되고 있다.
**데이터 마이그레이션**이란, 데이터베이스의 스키마 버전을 관리하기 위한 하나의 방법이다. 개발 시스템에에는 스키마가 변경되었지만, 운영 시스템에는 반영되지 않았을 때 마이그레이션을 수행한다.

## 3일차

---

### createQueryBuilder

QueryBuilder is one of the most powerful features of TypeORM - it allows you to build SQL queries using elegant and convenient syntax, execute them and get automatically transformed entities.

_Using repository_

```javascript
import { getRepository } from 'typeorm'

const user = await getRepository(User)
    .createQueryBuilder('user')
    .where('user.id = :id', { id: 1 })
    .getOne()
```

**소문자로 변경하기**

```javascript
.where('lower(sub.name) = :name', { name: name.toLowerCase() })
```

### JoinColumn

`@JoinColumn({ name: 'username', referencedColumnName: 'username' })`

foreign key 가 있는 테이블에 명시해주면 된다.

## 4일차

### 에러 데이터 가공

```json
{
    "errors": [
        {
            "target": {
                "email": "",
                "username": ""
            },
            "value": "",
            "property": "email",
            "children": [],
            "constraints": {
                "length": "Email is empty",
                "isEmail": "Must be a valid email address"
            }
        },
        {
            "target": {
                "email": "",
                "username": ""
            },
            "value": "",
            "property": "username",
            "children": [],
            "constraints": {
                "length": "Must be at least 3 characters long"
            }
        }
    ]
}
```

위 데이터를 가지고, 아래와 같이 에러 메세지를 만드는법

```JSON
{
    "email": "Email is empty",
    "username": "Must be at least 3 characters long"
}
```

```javascript
const mappedError = {}
errors.forEach((e) => {
    const key = e.property
    const value = Object.entries(e.constraints)[0][1]
    mappedError[key] = value
})
```

위 코드를 리펙토링 하면 (함수로 추출)

```javascript
const mapErrors = (errors: Object[]) => {
    let mappedErrors: any = {}
    errors.forEach((e: any) => {
        const key = e.property
        const value = Object.entries(e.constraints)[0][1]
        mappedErrors[key] = value
    })
    return mappedErrors
}
```

위 코드를 다시 리펠토링 하면 (지역변수 `mappedErrors` 제거)

```javascript
const mapErrors = (errors: Object[]) => {
    return errors.reduce((prev: any, err: any) => {
        prev[err.property] = Object.entries(err.constraints)[0][1]
        return prev
    }, {})
}
```

### 에러 데이터 처리

서버에서는 아래와 같은 형식으로 404로 데이터 전달한다.
프론트에서는 catch 에 걸릴 것이다.

```json
{
    "email": "Email is empty",
    "username": "Must be at least 3 characters long"
}
```

프론트에서는 아래와 같이 사용한다.

```javascript
const [errors, setErrors] = useState<any>({})

try {
    ...
} catch (err) {
    setErrors(err.response.data)
}

<Input error={errors.email} />

```

### 쿠키 사용하기

프론트 사이드

```javascript
Axios.default.withCredential = true
```

서버 사이드

```javascript
app.use(
    cors({
        credential: true,
        origin: 'http://localhost:3000', // 또는 배열로 전달
    })
)
```

## 5일차

### Navbar 예외처리

> `/register` 와 `/login` 에서는 보여주지 않기

```javascript
const { pathname } = useRouter()
const authRoute = pathname === '/register' || pathname === '/login'

!autRoute && <Navbar>
```

위 코드 리펙토링 하기

foo === bar || foo === far ... 와 같이 이어지는 경우 타겟을 배열로 변경하고 `includes` 메소드를 활용한다.

```javascript
const { pathname } = useRouter()
const authRoutes = ['/register', '/login']
const authRoute = authRoutes.includes(pathname)

!autRoute && <Navbar>
```

### Virtual Field 트릭

`@AfterLoad` 와 `protected` 를 이용해 `Virtual Field` 만들기

```javascript
class Post extends Entity {
    protected url: string

    @AfterLoad()
    @createFields() {
        this.url = '...'
    }
}
```
