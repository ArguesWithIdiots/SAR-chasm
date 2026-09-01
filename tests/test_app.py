import json
import os
import unittest
from unittest import mock

import app


VALID_SCORECARD = {
    "overall_status": "flag",
    "summary": "The chronology is clear, but specificity needs improvement.",
    "categories": [
        {"category": "5 W's Coverage", "status": "pass", "rationale": "All elements are stated."},
        {"category": "Typology Language", "status": "pass", "rationale": "Potential structuring is named."},
        {"category": "Specificity", "status": "flag", "rationale": "Transaction counts are absent."},
        {"category": "Internal Consistency", "status": "pass", "rationale": "Dates and totals align."},
        {"category": "Length & Density", "status": "pass", "rationale": "The narrative is focused."},
    ],
    "disclaimer": "AI-generated drafting critique only.",
}


class FakeResponse:
    def __init__(self, body):
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def read(self):
        return self.body


class AppTests(unittest.TestCase):
    def test_public_page_uses_sar_chasm_branding(self):
        page = (app.PUBLIC_DIR / "index.html").read_text(encoding="utf-8")
        self.assertIn("<title>SAR Chasm</title>", page)
        self.assertIn("Finding gaps in SAR narratives and logic quicker than you can.", page)

    def test_payload_is_stateless_and_uses_strict_schema(self):
        payload = app.build_openai_payload("A" * 100, "test-model")
        self.assertEqual(payload["model"], "test-model")
        self.assertIs(payload["store"], False)
        self.assertTrue(payload["text"]["format"]["strict"])
        self.assertEqual(payload["text"]["format"]["type"], "json_schema")
        self.assertIn("<narrative>", payload["input"][0]["content"][0]["text"])

    def test_rubric_requires_explicit_location_and_material_consistency(self):
        rubric = app.RUBRIC_PATH.read_text(encoding="utf-8")
        self.assertIn("Where” requires an explicit relevant transaction location or venue", rubric)
        self.assertIn("merely stating “cash deposits” does not satisfy where", rubric)
        self.assertIn("ultimate disposition of every suspicious dollar", rubric)
        self.assertIn("Apply a materiality threshold", rubric)

    def test_rubric_requires_baseline_for_profile_mismatch_claim(self):
        rubric = app.RUBRIC_PATH.read_text(encoding="utf-8")
        self.assertIn("customer’s known profile", rubric)
        self.assertIn("relevant baseline information", rubric)
        self.assertIn("Do not require unnecessary KYC details", rubric)
        self.assertIn("cryptocurrency exchanges", rubric)

    def test_rubric_does_not_manufacture_improvements_for_all_pass_result(self):
        rubric = app.RUBRIC_PATH.read_text(encoding="utf-8")
        self.assertIn("When every category passes", rubric)
        self.assertIn("No material deficiencies identified", rubric)
        self.assertIn("narrative is sufficient as written", rubric)
        self.assertIn("clearly qualify it as conditional", rubric)

    def test_rubric_flags_redundant_and_immaterial_detail(self):
        rubric = app.RUBRIC_PATH.read_text(encoding="utf-8")
        self.assertIn("Completeness and factual accuracy do not by themselves satisfy", rubric)
        self.assertIn("ordinary purchases, utilities, subscriptions, travel", rubric)
        self.assertIn("repeated warnings, customer explanations, document requests", rubric)
        self.assertIn("purposeful chronology showing material escalation", rubric)

    def test_rubric_requires_typology_mechanism_not_generic_conclusion(self):
        rubric = app.RUBRIC_PATH.read_text(encoding="utf-8")
        self.assertIn("names the suspected mechanism or typology", rubric)
        self.assertIn("only as “suspicious,” “unusual,” “inconsistent,”", rubric)
        self.assertIn("does not need to use a formal typology label", rubric)
        self.assertIn("Apply this explicit identification gate", rubric)
        self.assertIn("do not infer the typology yourself", rubric)
        self.assertIn("romance-scam-related elder financial exploitation", rubric)

    def test_validate_scorecard_accepts_complete_result(self):
        self.assertEqual(app.validate_scorecard(VALID_SCORECARD), VALID_SCORECARD)

    def test_validate_scorecard_rejects_missing_category(self):
        invalid = {**VALID_SCORECARD, "categories": VALID_SCORECARD["categories"][:-1]}
        with self.assertRaises(app.AppError):
            app.validate_scorecard(invalid)

    def test_extract_output_text_from_response_items(self):
        response = {
            "output": [
                {
                    "type": "message",
                    "content": [{"type": "output_text", "text": "{\"ok\": true}"}],
                }
            ]
        }
        self.assertEqual(app.extract_output_text(response), "{\"ok\": true}")

    @mock.patch("app.urllib.request.urlopen")
    def test_call_openai_parses_and_validates_response(self, urlopen):
        api_body = json.dumps(
            {
                "output": [
                    {
                        "type": "message",
                        "content": [
                            {"type": "output_text", "text": json.dumps(VALID_SCORECARD)}
                        ],
                    }
                ]
            }
        ).encode("utf-8")
        urlopen.return_value = FakeResponse(api_body)
        with mock.patch.dict(
            os.environ,
            {"OPENAI_API_KEY": "test-key", "OPENAI_MODEL": "test-model"},
            clear=False,
        ):
            result = app.call_openai("A fabricated narrative " * 10)
        self.assertEqual(result, VALID_SCORECARD)
        request = urlopen.call_args.args[0]
        sent_payload = json.loads(request.data.decode("utf-8"))
        self.assertIs(sent_payload["store"], False)
        self.assertEqual(sent_payload["model"], "test-model")
        self.assertEqual(request.get_header("Authorization"), "Bearer test-key")

    def test_call_openai_requires_api_key(self):
        with mock.patch.dict(os.environ, {"OPENAI_API_KEY": ""}, clear=False):
            with self.assertRaisesRegex(app.AppError, "not configured"):
                app.call_openai("A fabricated narrative " * 10)


if __name__ == "__main__":
    unittest.main()
