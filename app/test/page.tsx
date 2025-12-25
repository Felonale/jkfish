import Addition from '@/app/components/Addition'

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">
          Тестовая страница с выезжающей секцией
        </h1>

        <Addition
          title="Домашнее задание по теме BGP"
          extra={
            <>
              <p>Подробные критерии оценки:</p>
              <ul className="mt-1 list-disc pl-4">
                <li>Проверка peer-group <code>skills.kz</code></li>
                <li>Фильтрация WAN-сетей провайдера</li>
                <li>Наличие default-route от AS 65000.1</li>
              </ul>
            </>
          }
        >
          <p>
            Настройте iBGP между IR-SP1 и IR2, а также eBGP с ISP1/ISP2
            согласно выданной адресации.
          </p>
        </Addition>

        <Addition
          title="Лабораторная по OSPF и суммированию"
          extra={
            <>
              <p>Что должно быть в отчёте:</p>
              <ol className="mt-1 list-decimal pl-4">
                <li>Скриншоты таблиц маршрутизации DS1–DS4.</li>
                <li>Пояснение, какие сети были суммированы и почему.</li>
                <li>Проверка появления маршрута по умолчанию как внешнего.</li>
              </ol>
            </>
          }
        >
          <p>
            Настройте суммарные маршруты в area 50 и убедитесь,
            что DS1/DS2 получают суммарку и default-route.
          </p>
        </Addition>
      </div>
    </main>
  );
}
