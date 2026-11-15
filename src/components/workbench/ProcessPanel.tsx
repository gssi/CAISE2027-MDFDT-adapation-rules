"use client";

import { type ReactNode } from "react";

import { type AdaptationPlan, type IncomingRequest } from "@/engine/assistant/adaptation";
import { type Change, type ChangeSet } from "@/engine/assistant/change";
import { issueText, type Issue } from "@/engine/conformance";
import { type Dict } from "@/engine/kernel/model";
import { type WModel } from "@/engine/weaving/model";

import { Act, Code, Section, Tone } from "./controls";

export interface ProcessView {
  changeset: ChangeSet;
  drift: WModel;
  impact: WModel;
  plan: AdaptationPlan;
}

function Changes({ changes }: { changes: Change[] }) {
  if (!changes.length) return <p className="text-sm text-muted-foreground">No change.</p>;
  return (
    <ul className="space-y-1 text-sm">
      {changes.map((change, index) => (
        <li key={index} className="flex items-start gap-2">
          <Tone value={change.kind} />
          <span className="min-w-0">
            <Code>{change.element}</Code> <span className="text-xs text-muted-foreground">{change.level}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export interface DecisionBarProps {
  /** What the decision would commit: the checks it passes or fails. */
  preview: { issues: Issue[]; error: string | null; empty: boolean } | null;
  manual: boolean;
  busy: boolean;
  error: { message: string; issues?: Issue[] } | null;
  message: string;
  onMessage: (text: string) => void;
  onAccept: () => void;
  onReject: () => void;
  onEdit?: () => void;
}

/** Accept, edit or reject: only this produces a new version of the model. */
export function DecisionBar(props: DecisionBarProps) {
  const { preview } = props;
  const blocked = !preview || Boolean(preview.error) || preview.issues.length > 0 || preview.empty;
  return (
    <div className="space-y-2">
      {preview?.error && <p className="text-sm text-amber-900">{preview.error}</p>}
      {preview && !preview.error && preview.empty && (
        <p className="text-sm text-muted-foreground">Nothing in this model would change.</p>
      )}
      {preview && !preview.error && !preview.empty && preview.issues.length === 0 && (
        <p className="text-sm text-emerald-800">With this decision the model passes its checks.</p>
      )}
      {preview && preview.issues.length > 0 && (
        <div className="text-sm text-red-900">
          <p className="font-medium">The model would not pass its checks yet:</p>
          <ul className="list-disc pl-5">
            {preview.issues.map((issue) => (
              <li key={issueText(issue)}>{issueText(issue)}</li>
            ))}
          </ul>
        </div>
      )}
      <input
        aria-label="Message for the new version"
        className="h-10 w-full rounded-md border bg-background px-2 text-sm"
        placeholder="Message for the new version (optional)"
        value={props.message}
        onChange={(event) => props.onMessage(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Act variant="default" disabled={props.busy || props.manual || blocked} onClick={props.onAccept}>
          Accept as next version
        </Act>
        {props.onEdit && (
          <Act
            disabled={props.busy}
            title="Continue by hand: the proposed model becomes your working copy"
            onClick={props.onEdit}
          >
            Edit in the modeler
          </Act>
        )}
        <Act variant="ghost" disabled={props.busy} onClick={props.onReject}>
          Reject
        </Act>
      </div>
      {props.error && (
        <div className="text-sm text-red-900">
          <p className="font-medium">{props.error.message}</p>
          <ul className="list-disc pl-5">
            {(props.error.issues ?? []).map((issue) => (
              <li key={issueText(issue)}>{issueText(issue)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export interface ProcessPanelProps {
  view: ProcessView | null;
  /** live: a proposal the modeler can decide on; stored: the record of a version. */
  mode: "live" | "stored";
  focus: string;
  /** Why the process ran, in words. */
  cause?: string;
  chosen: Record<string, string>;
  onChoose: (drift: string, option: string) => void;
  decision?: Dict | null;
  /** stored: the recorded correspondences that hold in the version as it is checked now. */
  settled?: string[];
  requests: IncomingRequest[];
  onOpenRequest: (correspondence: string) => void;
  onOpen: (model: string) => void;
  children?: ReactNode; // the decision bar
}

export function ProcessPanel(props: ProcessPanelProps) {
  const { view, mode, focus, chosen } = props;
  const requests = props.requests.length > 0 && (
    <Section title="Requests from other DTs">
      <ul className="space-y-2 text-sm">
        {props.requests.map((request) => (
          <li key={request.correspondence} className="space-y-1.5 rounded-md border border-sky-200 bg-sky-50 p-2">
            <p>
              <strong>{request.from}</strong> asks: {request.request}
            </p>
            {request.proposal ? (
              <Act onClick={() => props.onOpenRequest(request.correspondence)}>See the version the assistant proposes</Act>
            ) : (
              <p className="text-muted-foreground">
                Nothing this DT reports fits: model the new data source by hand when the DT has one.
              </p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );

  if (!view) {
    return (
      <div className="space-y-5">
        {requests}
        <p className="text-sm text-muted-foreground">
          Nothing to process: this model equals its committed version and nothing reached it. Edit it, or send an
          observation from the Runtime tab, and the modelling assistant runs here.
        </p>
      </div>
    );
  }
  const { changeset, drift, impact, plan } = view;
  const vertical = drift.links.filter((l) => l.type === "VerticalDrift");
  const horizontal = drift.links.filter((l) => l.type === "HorizontalDrift");

  return (
    <div className="space-y-5">
      {props.cause && <p className="rounded-md bg-muted px-2 py-1.5 text-sm">{props.cause}</p>}
      {mode === "stored" && (
        <p className="rounded-md bg-muted px-2 py-1.5 text-sm">
          The record of the process that ran when this version was committed. The diagram and Checks show the version
          as it is checked now: a drift recorded here is drawn there only while it still stands.
        </p>
      )}
      <Section title="1 · Change set">
        <p className="text-sm">
          {changeset.changes.length} change(s), trigger <Code>{changeset.trigger}</Code>
          {changeset.originDT && (
            <>
              , origin <strong>{changeset.originDT}</strong> at level <strong>{changeset.originLevel}</strong>
            </>
          )}
          .
        </p>
        <details>
          <summary className="cursor-pointer text-xs text-muted-foreground">Elements</summary>
          <Changes changes={changeset.changes} />
        </details>
      </Section>

      <Section title="2 · Classified drift">
        {drift.links.length === 0 && <p className="text-sm text-emerald-800">No drift.</p>}
        {drift.props.proposedEvolution && (
          <p className="text-sm">
            Proposed evolution: <strong>{drift.props.proposedEvolution.type}</strong> v
            {drift.props.proposedEvolution.from} → v{drift.props.proposedEvolution.to} (
            {(drift.props.proposedEvolution.replaces ?? []).join(", ")}).
          </p>
        )}
        <ul className="space-y-2 text-sm">
          {vertical.map((link) => (
            <li key={link.id} className="rounded-md border border-red-200 bg-red-50 p-2">
              <p className="font-medium">
                Vertical, {link.props.origin} · {link.props.dt}
              </p>
              <p>
                <Code>{link.ends.lower}</Code> ↕ <Code>{link.ends.upper}</Code>
              </p>
              <p className="text-muted-foreground">{(link.props.reasons ?? []).join("; ")}</p>
            </li>
          ))}
          {horizontal.map((link) => {
            const settled = mode === "stored" && (props.settled ?? []).includes(link.props.correspondence);
            return (
              <li
                key={link.id}
                className={`rounded-md border p-2 ${settled ? "border-border bg-muted/50" : "border-amber-200 bg-amber-50"}`}
              >
                <p className="flex items-center gap-2 font-medium">
                  Horizontal <Tone value={link.props.status} /> {link.props.correspondence}
                </p>
                <p>
                  <Code>{link.ends.participating ?? "?"}</Code> → <Code>{link.ends.initiating}</Code>
                </p>
                <p className="text-muted-foreground">{(link.props.reasons ?? []).join("; ")}</p>
                {settled && (
                  <p className="mt-1 text-emerald-800">
                    Recorded then, not a drift now: {link.props.correspondence} holds in this version, so the diagram
                    does not mark it.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="3 · Impact report">
        {impact.links.length === 0 && <p className="text-sm text-muted-foreground">No element is affected.</p>}
        <ul className="space-y-1 text-sm">
          {impact.links.map((link) => (
            <li key={link.id} className="flex items-start gap-2">
              <Tone value={link.props.severity} />
              <span className="min-w-0">
                {link.props.reason}{" "}
                <span className="text-xs text-muted-foreground">
                  ({link.props.direction}, {link.props.category})
                </span>
              </span>
            </li>
          ))}
        </ul>
        {impact.links.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Affected: {(impact.props.affectedDTs ?? []).join(", ") || "none"}. Not affected:{" "}
            {(impact.props.unaffectedDTs ?? []).join(", ") || "none"}.
          </p>
        )}
      </Section>

      <Section title="4 · Adaptation plan">
        {plan.resolutions.length === 0 && <p className="text-sm text-muted-foreground">No correspondence to resolve.</p>}
        {plan.resolutions.map((resolution) => {
          const mine = resolution.owner === focus;
          return (
            <fieldset key={resolution.drift} className="space-y-1.5">
              <legend className="text-sm font-medium">{resolution.correspondence ?? resolution.element}</legend>
              {!mine && (
                <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-sm">
                  <span className="min-w-0 flex-1">
                    This correspondence belongs to <strong>{resolution.owner}</strong>: its modeler decides, once this
                    model has a new version.
                  </span>
                  <Act onClick={() => props.onOpen(resolution.owner)}>Open {resolution.owner}</Act>
                </div>
              )}
              {resolution.options.map((option) => (
                <label
                  key={option.id}
                  className="flex min-h-10 items-start gap-2 rounded-md border p-2 text-sm has-checked:border-foreground has-checked:bg-muted/60"
                >
                  {mine && (
                    <input
                      type="radio"
                      className="mt-1 size-4 shrink-0"
                      name={resolution.drift}
                      disabled={mode !== "live"}
                      checked={chosen[resolution.drift] === option.id}
                      onChange={() => props.onChoose(resolution.drift, option.id)}
                    />
                  )}
                  <span className="min-w-0">
                    <span className="font-medium">
                      ({option.id}) {option.kind.replace("_", " ")}
                    </span>
                    {!option.automatic && <span className="text-amber-800"> · needs the modeler</span>}
                    <br />
                    {option.description}
                  </span>
                </label>
              ))}
            </fieldset>
          );
        })}
        {plan.interim.length > 0 && (
          <div className="text-sm">
            <p className="font-medium">Until the plan is committed</p>
            <ul className="list-disc pl-5">
              {plan.interim.map((entry) => (
                <li key={`${entry.element}${entry.because}`}>
                  <Code>{entry.element}</Code> → {entry.behaviour.replaceAll("_", " ")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {mode === "stored" && props.decision && (
        <Section title="5 · Modeler decision">
          <p className="text-sm">
            <strong>{props.decision.decision}</strong>
            {props.decision.option && ` option (${props.decision.option})`}
            {props.decision.choices &&
              ` ${Object.entries(props.decision.choices as Record<string, string>)
                .map(([d, option]) => `${d}: (${option})`)
                .join(", ")}`}
          </p>
        </Section>
      )}
      {mode === "live" && (
        <Section title="5 · Modeler decision">
          <p className="text-xs text-muted-foreground">
            The Changes tab shows, as a diff, exactly what this decision would commit.
          </p>
          {props.children}
        </Section>
      )}
      {requests}
    </div>
  );
}
