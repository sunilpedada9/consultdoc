module.exports=(pageRows,pageNo)=>{
    let limit=Number(pageRows) ? Number(pageRows) : 3;
    let page=pageNo==0 ? 1 : Number(pageNo);
    let offset=pageNo ? (page-1)*limit :0;

    return{limit,offset};
}