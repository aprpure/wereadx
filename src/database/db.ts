import { postgres } from "../deps.ts";
import runtime from "../runtime.ts";

let sql = ''; // 将变量声明为let，以便在后面重新赋值

// 检查 runtime.databaseUrl 是否存在
if (runtime.databaseUrl) {
    // 如果存在，则使用 postgres 模块构建数据库连接
    sql = postgres.default(runtime.databaseUrl, {
        onnotice: () => {},
    });
} else {
    // 如果不存在，则打印一条消息并跳过
    console.log("Database URL is missing. Skipping database connection setup.");
}

export default sql;
