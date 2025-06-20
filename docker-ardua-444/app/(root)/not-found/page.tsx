export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold">Комната не найдена</h1>
            <p className="mt-2">Проверьте правильность введенного roomId или зарегистрируйтесь, чтобы создать новую комнату.</p>
            <a href="/register" className="mt-4 text-primary underline">Зарегистрироваться</a>
        </main>
    );
}