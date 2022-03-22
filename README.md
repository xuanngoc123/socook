//tao thu muc chua cau lenh trong project
Create model: npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string

//thuc hien cau lenh trong thu muc duoc tao
Thuc hien vao db: npx sequelize-cli db:migrate

//tao thu muc chua cau lenh trong project
Create seed: npx sequelize-cli seed:generate --name demo-user

//thuc hien cau lenh trong thu muc duoc tao
Chay seed: npx sequelize-cli db:seed:all