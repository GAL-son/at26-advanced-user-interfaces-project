"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";
import { focusFlatSection } from "@/app/_utils/navigation";
import { useTranslations } from "next-intl";

interface Driver {
    id: string;
    driverName: string;
    steamId: string;
    car: string;
}

const PAGE_ORDER = ["menu", "tournament-registration", "next-section", "footer"];

export default function TournamentForm() {
    const t = useTranslations("TournamentForm"); // Przestrzeń nazw dla tłumaczeń
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [success, setSuccess] = useState(false);

    // Dynamiczny schemat walidacji Zod zintegrowany z next-intl
    const registrationSchema = z.object({
        driverName: z.string().min(3, t("validation.nameMin")),
        steamId: z.string().regex(/^\d{17}$/, t("validation.steamIdRegex")),
        car: z.string().min(1, t("validation.carRequired")),
    });

    type FormData = z.infer<typeof registrationSchema>;

    const totalFormItems = 4;
    const { registerItem, handleKeyDown } = useKeyboardNavigation({
        itemCount: totalFormItems,
        orientation: "vertical",
        loop: false,
        onLeave: (direction) => {
            focusFlatSection("tournament-registration", direction, PAGE_ORDER);
        },
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(registrationSchema),
    });

    const fetchDrivers = async () => {
        try {
            const res = await fetch("/api/mock-tournament");
            if (!res.ok) throw new Error();
            const data = await res.json();
            setDrivers(data);
        } catch {
            setFetchError(t("errors.fetch"));
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const onSubmit = async (data: FormData) => {
        setSubmitError(null);
        setSuccess(false);
        try {
            const response = await fetch("/api/mock-tournament", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error();

            setSuccess(true);
            reset();
            fetchDrivers();
        } catch {
            setSubmitError(t("errors.submit"));
        }
    };

    return (
        <section
            data-section="tournament-registration"
            className="max-w-2xl mx-auto p-6 flex flex-col gap-6 font-sans text-[var(--color-brand-text)]"
        >
            <div className="bg-[var(--color-brand-navy-light)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] p-6 shadow-xl">
                <h2 className="text-page-title text-[var(--color-brand-yellow)] mb-6">
                    {t("title")}
                </h2>

                {submitError && (
                    <div className="mb-4 p-3 bg-[var(--color-elo-loss)] text-white text-sm font-mono rounded-md">
                        {submitError}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-[var(--color-elo-gain)] text-white text-sm font-mono rounded-md">
                        {t("successMessage")}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

                    {/* Input 1: Nick */}
                    <div className="flex flex-col gap-1">
                        <label className="text-btn-mono text-[var(--color-brand-text-muted)] uppercase">{t("labels.driverName")}</label>
                        <input
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyDown(e, 0)}
                            className="w-full bg-[var(--color-brand-navy)] text-[var(--color-brand-text)] border border-[var(--color-brand-text-muted)] focus-brand p-3 rounded-md font-sans"
                            placeholder="np. Driver_404"
                            // Wyciągamy ref z register i łączymy go ręcznie w elemencie:
                            {...register("driverName")}
                            ref={(e) => {
                                register("driverName").ref(e); // Dajemy element do react-hook-form
                                registerItem(0)(e);            // Dajemy element do useKeyboardNavigation
                            }}
                        />
                        {errors.driverName && (
                            <span className="text-[var(--color-elo-loss)] text-xs font-mono">{errors.driverName.message}</span>
                        )}
                    </div>

                    {/* Input 2: SteamID */}
                    <div className="flex flex-col gap-1">
                        <label className="text-btn-mono text-[var(--color-brand-text-muted)] uppercase">{t("labels.steamId")}</label>
                        <input
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyDown(e, 1)}
                            className="w-full bg-[var(--color-brand-navy)] text-[var(--color-brand-text)] border border-[var(--color-brand-text-muted)] focus-brand p-3 rounded-md font-mono"
                            placeholder="76561198XXXXXXXXX"
                            {...register("steamId")}
                            ref={(e) => {
                                register("steamId").ref(e);
                                registerItem(1)(e);
                            }}
                        />
                        {errors.steamId && (
                            <span className="text-[var(--color-elo-loss)] text-xs font-mono">{errors.steamId.message}</span>
                        )}
                    </div>

                    {/* Input 3: Samochód */}
                    <div className="flex flex-col gap-1">
                        <label className="text-btn-mono text-[var(--color-brand-text-muted)] uppercase">{t("labels.car")}</label>
                        <select
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                                    e.preventDefault();
                                }
                                handleKeyDown(e, 2);
                            }}
                            className="w-full bg-[var(--color-brand-navy)] text-[var(--color-brand-text)] border border-[var(--color-brand-text-muted)] focus-brand p-3 rounded-md font-sans appearance-none"
                            defaultValue=""
                            {...register("car")}
                            ref={(e) => {
                                register("car").ref(e);
                                registerItem(2)(e);
                            }}
                        >
                            <option value="" disabled className="text-[var(--color-brand-text-muted)]">-- {t("labels.selectCar")} --</option>
                            <option value="Porsche 911 GT3">Porsche 911 GT3</option>
                            <option value="Ferrari 488 GT3">Ferrari 488 GT3</option>
                            <option value="BMW M4 GT3">BMW M4 GT3</option>
                        </select>
                        {errors.car && (
                            <span className="text-[var(--color-elo-loss)] text-xs font-mono">{errors.car.message}</span>
                        )}
                    </div>

                    {/* Button 4: Submit */}
                    <button
                        type="submit"
                        tabIndex={0}
                        ref={registerItem(3)} // Przycisku nie rejestrujesz w react-hook-form, więc zostaje czysty ref
                        onKeyDown={(e) => handleKeyDown(e, 3)}
                        disabled={isSubmitting}
                        className="w-full mt-2 bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-brand-navy-dark)] font-bold text-nav-button uppercase py-3 px-6 rounded-md focus-brand cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? t("buttons.processing") : t("buttons.submit")}
                    </button>
                </form>
            </div>

            {/* Lista pobierana przez GET */}
            <div className="bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] p-6">
                <h3 className="text-card-title text-[var(--color-brand-text)] mb-4">
                    {t("listTitle")}
                </h3>
                {fetchError && (
                    <div className="mb-4 p-3 bg-[var(--color-elo-loss)] text-white text-sm font-mono rounded-md">
                        {fetchError}
                    </div>
                )}
                <div className="max-h-48 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
                    {drivers.length === 0 ? (
                        <p className="text-btn-mono text-[var(--color-brand-text-muted)]">{t("noDrivers")}</p>
                    ) : (
                        drivers.map((driver) => (
                            <div
                                key={driver.id}
                                className="flex justify-between items-center p-3 bg-[var(--color-brand-navy-light)] rounded-md border-l-4 border-[var(--color-brand-yellow)] min-w-0 gap-4"
                            >
                                {/* min-w-0 na rodzicu jest kluczowe, aby flex pozwolił dzieciom na truncate */}
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-[var(--color-brand-text)] text-nav-link truncate">{driver.driverName}</div>
                                    {/* Zastosowanie truncate do ucinania SteamID */}
                                    <div className="text-xs text-[var(--color-brand-text-muted)] font-mono truncate max-w-[150px]" title={driver.steamId}>
                                        ID: {driver.steamId}
                                    </div>
                                </div>
                                <span className="text-btn-mono bg-[var(--color-brand-navy)] px-3 py-1 rounded text-[var(--color-brand-yellow)] border border-[var(--color-brand-navy-light)] shrink-0 whitespace-nowrap">
                                    {driver.car}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}