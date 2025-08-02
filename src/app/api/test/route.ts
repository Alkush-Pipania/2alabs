


export async function GET(reqeust : Request){
  try{
    return Response.json({message : "test route is working!"}, {status: 200})
  }
  catch(error){
    console.error("Error in test route:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }


}