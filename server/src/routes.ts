import { prisma } from "./lib/prisma";
import {FastifyInstance} from 'fastify'
import {z} from 'zod'
import { date } from "zod/lib";
import dayjs from "dayjs";

export async function appRoutes(app:FastifyInstance){
    
    app.post('/habits', async (request) => {
        const creatHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(
                z.number().min(0).max(6)
            )
        })
        const {title, weekDays} = creatHabitBody.parse(request.body)

        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data:{
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map(weekDays => {
                        return{
                            week_day: weekDays,
                        }
                    })
                }
            }
        })
    })


    app.get('/day', async (request) => {
        //deve trazer todos os habitos possiveis e todos os habitos que ja foram completados
        const getDayParams = z.object({
            date: z.coerce.date() //converte o parametro recebido em data
        })

         
        const {date} = getDayParams.parse(request.query);

        const parseDate = dayjs(date).startOf('day')
        const weekDay = parseDate.get('day')

        const possivleHabits = await prisma.habit.findMany({
            where: {
                created_at : {
                    lte : date,
                },
                weekDays:{
                    some:{
                        week_day: weekDay
                    } 
                }
            }
        })

        const day = await prisma.day.findUnique({
            where:{
                date:parseDate.toDate()
            },
            include:{
                dayHabits:true,
            }
        })

        const completedHabits = day?.dayHabits.map(dayHabit => {
            return dayHabit.id
        })

        return {possivleHabits,completedHabits}
    })
}


