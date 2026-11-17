#!/usr/bin/env python3
"""Replace thin court descriptions with unique factual summaries from directory fields."""

import json
from pathlib import Path


def main() -> None:
    path = Path(__file__).resolve().parents[1] / "public" / "data" / "courts.json"
    courts = json.loads(path.read_text(encoding="utf-8"))
    updated = 0

    for court in courts:
        name = (court.get("name") or "").strip()
        city = (court.get("city") or "").strip()
        state = (court.get("state") or "").strip()
        types = court.get("types") or []
        type_label = ", ".join(types) if types else "court"
        hours = (court.get("hours") or "").strip()
        phone = (court.get("phone") or "").strip()
        address = (court.get("address") or "").strip()
        zip_code = (court.get("zip") or "").strip()
        location = ", ".join(part for part in [city, state] if part)
        serving = location or "the local area"

        full_address = address
        if location:
            full_address = f"{address}, {location}" if address else location
        if zip_code:
            full_address = f"{full_address} {zip_code}".strip()

        description = (
            f"{name} is a {type_label} serving {serving}. "
            f"Listed address: {full_address}. "
        )
        if phone:
            description += f"Phone: {phone}. "
        if hours:
            description += f"Hours: {hours}. "
        description += "Confirm filing rules, hours, and closures with the court before you visit."

        old = (court.get("description") or "").strip()
        if (
            len(old.split()) < 25
            or old.rstrip(".") == name
            or old.startswith(f"{name}.")
        ):
            court["description"] = description
            updated += 1

        meta = (court.get("metaDescription") or "").strip()
        if not meta or len(meta.split()) < 12:
            meta_bits = [f"Find contact details for {name}"]
            if location:
                meta_bits[0] += f" in {location}"
            if phone:
                meta_bits.append(f"Phone {phone}")
            meta_bits.append("Address, hours, and court type information.")
            court["metaDescription"] = ". ".join(meta_bits)

    path.write_text(json.dumps(courts, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Updated descriptions: {updated} of {len(courts)}")
    print(f"Sample: {courts[0]['description'][:220]}")


if __name__ == "__main__":
    main()
