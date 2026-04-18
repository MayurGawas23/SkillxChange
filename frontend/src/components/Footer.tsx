export default function Footer () {
    return (
          <footer className="bg-zinc-50 dark:bg-zinc-950 w-full py-12 border-t border-zinc-200/10 tonal-layering">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-headline mb-2">SkillxChange</div>
            <div className="font-sans text-sm leading-relaxed text-zinc-500">© 2026 SkillxChange. All Rights Reserved.</div>
          </div>
          <div className="flex space-x-8 font-sans text-sm leading-relaxed">
            <a className="text-zinc-500 hover:text-indigo-500 transition-colors" href="#">Privacy</a>
            <a className="text-zinc-500 hover:text-indigo-500 transition-colors" href="#">Terms</a>
            <a className="text-zinc-500 hover:text-indigo-500 transition-colors" href="#">Support</a>
            <a className="text-zinc-500 hover:text-indigo-500 transition-colors" href="#">Careers</a>
          </div>
        </div>
      </footer>
    )
}