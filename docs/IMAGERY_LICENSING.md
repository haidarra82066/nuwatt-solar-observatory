# Imagery acquisition and licensing policy

## Rule

No imagery enters training, evaluation, derived-data publication, or long-term
storage until its permitted uses are recorded.

## Source registry fields

- provider and product
- acquisition identifier, date, resolution, and footprint
- licence or contract identifier
- permitted training, inference, caching, derivative, and publication uses
- attribution requirement
- expiry, deletion, or re-download requirement
- reviewer and decision timestamp

## Starting sources

- Sentinel-2 for national temporal screening and large installations
- OpenAerialMap and documented humanitarian/open aerial releases where coverage exists
- legally reusable Beirut-area open imagery for local experiments
- international open PV datasets for pretraining and benchmarking
- installer- or partner-confirmed NuWatt systems under explicit agreements

## Prohibited foundation pattern

Do not scrape Google Earth or Google Maps screenshots for bulk extraction,
machine-learning training, or a redistributable national database. Manual visual
exploration is not a substitute for a licence decision.

Commercial imagery may be used only under terms that match the intended model
training, storage, derived output, and publication workflow. Source pixels are
never assumed redistributable merely because derived aggregates are public.
