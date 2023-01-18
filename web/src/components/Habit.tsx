interface HabitProps {
    completed: number
}

export function Habit(props: HabitProps){
    return (
        <div className="bg-zinc-900 w-10 h-10 text-red rounded m-2 text-center flex items-center justify-center" >
            {props.completed}
        </div>
    )
}