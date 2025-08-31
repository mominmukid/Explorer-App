

// this is the standard response class for API responses
 class ApiResponce{
   constructor(statusCode,data,message="Success"){
      this.statusCode=statusCode,
      this.data=data,
      this.message=message
      this.success=statusCode <400
   }
 }

 export {
   ApiResponce
 }