import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  FiCheck,
  FiExternalLink,
  FiLink2,
  FiUploadCloud,
} from "react-icons/fi";

import { STORE_CATALOG, storeLogo } from "./storeCatalog";
import { parseOrderCsv } from "./purchaseCsv";
import {
  errorText,
  fetchStoreConnections,
  formatPurchaseDate,
  importStoreOrders,
  linkStoreAccount,
  unlinkStoreAccount,
} from "./purchasesApi";

/**
 * Connected stores.
 *
 * The store picker is the entry point: click a logo, link the account label you
 * shop with, then import that store's order export. Imported orders become
 * ordinary purchase records (so the log, analytics and expense links all work),
 * and the store's order id keeps a repeat import from double-counting.
 *
 * No store password or card is ever collected — only the label, which is shown
 * back to the user so they know which account is linked.
 */

/**
 * The store's own app icon, bundled with the app so the picker renders the real
 * mark without a network round trip. A missing or unreadable image falls back
 * to the store's initials on its brand colour instead of a broken icon.
 */
const StoreLogo = ({ store, size = 32 }) => {
  const [failed, setFailed] = useState(false);
  const source = store.logo || storeLogo(store.key);

  if (!source || failed) {
    return (
      <span
        aria-hidden="true"
        className="grid flex-shrink-0 place-items-center rounded-[9px] font-bold text-white shadow-sm"
        style={{
          width: size,
          height: size,
          backgroundColor: store.accent,
          fontSize: Math.round(size * 0.34),
        }}
      >
        {store.mark}
      </span>
    );
  }

  return (
    <img
      src={source}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="flex-shrink-0 rounded-[9px] object-contain shadow-sm"
      style={{ width: size, height: size }}
    />
  );
};

export const StoreConnections = ({ onRecordsChanged }) => {
  const [stores, setStores] = useState(STORE_CATALOG);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");

  const [activeKey, setActiveKey] = useState("");
  const [accountLabel, setAccountLabel] = useState("");
  const [csvText, setCsvText] = useState("");
  const [busy, setBusy] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [result, setResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchStoreConnections();
      if (data.stores.length > 0) setStores(data.stores);
      setConnections(data.connections);
    } catch (requestError) {
      setLoadError(errorText(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeStore = stores.find((store) => store.key === activeKey) || null;
  const activeConnection =
    connections.find((connection) => connection.provider === activeKey) || null;
  const parsed = useMemo(() => parseOrderCsv(csvText), [csvText]);

  const openStore = (store) => {
    const existing = connections.find(
      (connection) => connection.provider === store.key,
    );

    setActiveKey(store.key);
    setAccountLabel(existing?.accountLabel || "");
    setCsvText("");
    setResult(null);
    setDialogError("");
  };

  const closeDialog = () => {
    if (busy) return;
    setActiveKey("");
    setResult(null);
    setCsvText("");
    setDialogError("");
  };

  const link = async () => {
    if (!activeStore) return;

    setBusy("link");
    setDialogError("");
    try {
      const connection = await linkStoreAccount({
        provider: activeStore.key,
        accountLabel: accountLabel.trim(),
      });

      setConnections((current) => [
        ...current.filter((row) => row.provider !== connection.provider),
        connection,
      ]);
      setMessage(
        `${activeStore.name} linked. Import the store's order export to add its purchases.`,
      );
    } catch (requestError) {
      setDialogError(errorText(requestError));
    } finally {
      setBusy("");
    }
  };

  const unlink = async () => {
    if (!activeStore || !activeConnection) return;

    const confirmed = window.confirm(
      `Unlink ${activeStore.name}? Purchases already imported stay in your log.`,
    );
    if (!confirmed) return;

    setBusy("unlink");
    setDialogError("");
    try {
      await unlinkStoreAccount(activeConnection._id);
      setConnections((current) =>
        current.filter((row) => row._id !== activeConnection._id),
      );
      setAccountLabel("");
      setResult(null);
      setCsvText("");
      setMessage(
        `${activeStore.name} unlinked. Your imported purchases were kept.`,
      );
    } catch (requestError) {
      setDialogError(errorText(requestError));
    } finally {
      setBusy("");
    }
  };

  const runImport = async () => {
    if (!activeConnection || parsed.orders.length === 0) return;

    setBusy("import");
    setDialogError("");
    try {
      const response = await importStoreOrders(
        activeConnection._id,
        parsed.orders,
      );

      setConnections((current) =>
        current.map((row) =>
          row._id === response.connection._id ? response.connection : row,
        ),
      );
      setResult(response);
      setCsvText("");
      setMessage(
        `${response.imported} order${
          response.imported === 1 ? "" : "s"
        } imported from ${activeStore.name}.`,
      );
      onRecordsChanged?.();
    } catch (requestError) {
      setDialogError(errorText(requestError));
    } finally {
      setBusy("");
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setDialogError("Choose an order export smaller than 1 MB.");
      return;
    }

    try {
      setCsvText(await file.text());
      setDialogError("");
    } catch {
      setDialogError("That file could not be read.");
    }
  };

  return (
    <section
      aria-labelledby="connected-stores-heading"
      className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="connected-stores-heading" className="text-sm font-semibold">
            Connected stores
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Link the shops you buy from, then import their order history into this
            purchase log.
          </p>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {connections.length} of {stores.length} linked
        </span>
      </div>

      {loadError && (
        <Alert
          severity="warning"
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={load} sx={{ textTransform: "none" }}>
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      )}

      {message && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {stores.map((store) => {
          const connection = connections.find(
            (row) => row.provider === store.key,
          );

          return (
            <li key={store.key}>
              <button
                type="button"
                onClick={() => openStore(store)}
                aria-label={
                  connection
                    ? `Manage ${store.name} account`
                    : `Link ${store.name} account`
                }
                className="group relative flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-2 text-left transition-colors hover:border-[var(--accent-electric)] hover:bg-[var(--surface-tertiary)]"
              >
                <StoreLogo store={store} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold text-[var(--text-primary)]">
                    {store.name}
                  </span>
                  <span
                    className={`mt-0.5 flex items-center gap-1 text-[10px] font-medium ${
                      connection ? "text-emerald-500" : "text-[var(--text-muted)]"
                    }`}
                  >
                    {connection ? (
                      <>
                        <FiCheck size={10} /> Linked
                      </>
                    ) : (
                      <>
                        <FiLink2 size={10} /> Link account
                      </>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {loading && connections.length === 0 && (
        <p className="mt-2 text-[11px] text-[var(--text-muted)]" role="status">
          Loading linked accounts…
        </p>
      )}

      <Dialog
        open={Boolean(activeStore)}
        onClose={busy ? undefined : closeDialog}
        fullWidth
        maxWidth="sm"
      >
        {activeStore && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <StoreLogo store={activeStore} size={40} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>
                  {activeStore.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {activeStore.tagline}
                </Typography>
              </Box>
            </DialogTitle>

            <DialogContent dividers>
              <Stack spacing={2}>
                {dialogError && (
                  <Alert severity="error" onClose={() => setDialogError("")}>
                    {dialogError}
                  </Alert>
                )}

                {result && (
                  <Alert severity="success">
                    {result.imported} order
                    {result.imported === 1 ? "" : "s"} added to your purchase log.
                    {result.duplicates > 0
                      ? ` ${result.duplicates} already-recorded order${
                          result.duplicates === 1 ? " was" : "s were"
                        } skipped.`
                      : ""}
                  </Alert>
                )}

                {!activeConnection ? (
                  <Stack spacing={1.75}>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      Link the account you shop with. FinTrack keeps only this
                      label — never a store password, card or login.
                    </Typography>

                    <TextField
                      label="Store account (email or phone)"
                      value={accountLabel}
                      onChange={(event) => setAccountLabel(event.target.value)}
                      size="small"
                      autoFocus
                      helperText="Shown on this page so you know which account is linked."
                    />

                    <Box
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: "10px",
                        p: 1.75,
                      }}
                    >
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                        How orders arrive
                      </Typography>
                      <Box
                        component="ol"
                        sx={{
                          m: 0,
                          mt: 0.75,
                          pl: 2.25,
                          fontSize: 12.5,
                          color: "text.secondary",
                          display: "grid",
                          gap: 0.5,
                        }}
                      >
                        <li>Link this store account.</li>
                        <li>{activeStore.importHint}</li>
                        <li>
                          Import the file here — each order becomes a purchase
                          record.
                        </li>
                      </Box>
                    </Box>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
                        border: 1,
                        borderColor: "divider",
                        borderRadius: "10px",
                        p: 1.75,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                          Linked account
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                          {activeConnection.accountLabel}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                          Imported so far
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                          {activeConnection.totalImported || 0} orders
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                          Last import
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                          {activeConnection.lastSyncedAt
                            ? formatPurchaseDate(activeConnection.lastSyncedAt)
                            : "Never"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                        Import order history
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
                        {activeStore.importHint}
                      </Typography>

                      <Button
                        component="label"
                        size="small"
                        variant="outlined"
                        startIcon={<FiUploadCloud size={15} />}
                        sx={{ mt: 1.25, textTransform: "none", fontWeight: 600 }}
                      >
                        Choose CSV file
                        <input
                          type="file"
                          hidden
                          accept=".csv,.txt,text/csv,text/plain"
                          aria-label={`Order export file for ${activeStore.name}`}
                          onChange={handleFile}
                        />
                      </Button>

                      <TextField
                        multiline
                        minRows={4}
                        fullWidth
                        size="small"
                        sx={{ mt: 1.5 }}
                        label="Or paste the order list"
                        placeholder={
                          "Order ID, Order Date, Title, Price, Quantity\nAMZ-1001, 2026-10-04, Headphones, 8999, 1"
                        }
                        value={csvText}
                        onChange={(event) => setCsvText(event.target.value)}
                      />

                      <Typography
                        sx={{
                          fontSize: 12,
                          mt: 1,
                          color: parsed.orders.length ? "success.main" : "text.secondary",
                        }}
                      >
                        {csvText.trim()
                          ? `${parsed.orders.length} order${
                              parsed.orders.length === 1 ? "" : "s"
                            } ready${
                              parsed.skipped > 0
                                ? ` · ${parsed.skipped} row${
                                    parsed.skipped === 1 ? "" : "s"
                                  } skipped`
                                : ""
                            }`
                          : "CSV or tab-separated exports from the store work as-is."}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap" }}>
              <Button
                href={activeStore.ordersUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                size="small"
                endIcon={<FiExternalLink size={13} />}
                sx={{ textTransform: "none" }}
              >
                Open {activeStore.name}
              </Button>

              <Box sx={{ flex: 1 }} />

              {activeConnection && (
                <Button
                  color="error"
                  onClick={unlink}
                  disabled={Boolean(busy)}
                  sx={{ textTransform: "none" }}
                >
                  {busy === "unlink" ? "Unlinking…" : "Unlink"}
                </Button>
              )}

              <Button
                color="inherit"
                onClick={closeDialog}
                disabled={Boolean(busy)}
                sx={{ textTransform: "none" }}
              >
                Close
              </Button>

              {!activeConnection ? (
                <Button
                  variant="contained"
                  onClick={link}
                  disabled={busy === "link" || accountLabel.trim().length < 3}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {busy === "link" ? "Linking…" : "Link account"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={runImport}
                  disabled={busy === "import" || parsed.orders.length === 0}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {busy === "import"
                    ? "Importing…"
                    : `Import ${parsed.orders.length} order${
                        parsed.orders.length === 1 ? "" : "s"
                      }`}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </section>
  );
};

export default StoreConnections;
