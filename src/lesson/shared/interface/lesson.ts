export interface ILesson{
    create(lessonId:number , dto:any):Promise<any>
}